import type { Blueprint } from './db';
import {
  addBlueprint,
  deleteBlueprint,
  getBlueprints,
  updateBlueprint,
} from './blueprints';
import { addTodoFromBlueprint } from './todos';
import { createNumberPicker, createToggle } from './components';

export const createBlueprintsView = (): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'view-container blueprints-view';

  const header = document.createElement('div');
  header.className = 'view-header';

  const title = document.createElement('h1');
  title.textContent = 'Blueprints';
  header.appendChild(title);

  const form = document.createElement('form');
  form.className = 'add-todo-form';
  form.setAttribute('aria-label', 'Add new blueprint');

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'todo-input';
  titleInput.placeholder = 'Blueprint title...';
  titleInput.setAttribute('aria-label', 'Blueprint title');
  titleInput.required = true;

  const addButton = document.createElement('button');
  addButton.type = 'submit';
  addButton.textContent = '+';
  addButton.className = 'add-button';
  addButton.setAttribute('aria-label', 'Add blueprint');

  form.appendChild(titleInput);
  form.appendChild(addButton);

  header.appendChild(form);

  const blueprintList = document.createElement('ul');
  blueprintList.className = 'todo-list blueprint-list';
  blueprintList.setAttribute('role', 'list');

  const renderBlueprints = async () => {
    const blueprints = await getBlueprints();
    blueprintList.innerHTML = '';

    if (blueprints.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No blueprints yet. Create one above!';
      blueprintList.appendChild(emptyState);
      return;
    }

    blueprints.forEach((blueprint) => {
      const li = createBlueprintItem(blueprint, renderBlueprints);
      blueprintList.appendChild(li);
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleText = titleInput.value.trim();
    if (!titleText) return;

    try {
      await addBlueprint(titleText, 7, true);
      titleInput.value = '';
      await renderBlueprints();
    } catch (error) {
      console.error('Failed to add blueprint:', error);
    }
  });

  container.appendChild(header);
  container.appendChild(blueprintList);

  renderBlueprints();

  return container;
};

const createBlueprintItem = (
  blueprint: Blueprint,
  onUpdate: () => Promise<void>
): HTMLElement => {
  const li = document.createElement('li');
  li.className = 'todo-item blueprint-item';
  li.setAttribute('role', 'listitem');

  const blueprintRow = document.createElement('div');
  blueprintRow.className = 'task-row';

  const label = document.createElement('span');
  label.className = 'todo-label';
  label.textContent = blueprint.title;
  label.style.cursor = 'pointer';

  const durationBadge = document.createElement('span');
  durationBadge.className = 'duration-badge';
  if (blueprint.duration !== undefined) {
    durationBadge.textContent = `${blueprint.duration}d`;
  }

  const recurBadge = document.createElement('span');
  recurBadge.className = 'recur-badge';
  if (blueprint.recur) {
    recurBadge.textContent = '↻';
    recurBadge.title = 'Recurring';
  }

  const createTaskButton = document.createElement('button');
  createTaskButton.className = 'create-task-button';
  createTaskButton.textContent = '→';
  createTaskButton.setAttribute('aria-label', `Create task from "${blueprint.title}"`);
  createTaskButton.title = 'Create task';

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.textContent = '×';
  deleteButton.setAttribute('aria-label', `Delete "${blueprint.title}"`);

  blueprintRow.appendChild(label);
  if (blueprint.duration !== undefined) {
    blueprintRow.appendChild(durationBadge);
  }
  if (blueprint.recur) {
    blueprintRow.appendChild(recurBadge);
  }
  blueprintRow.appendChild(createTaskButton);
  blueprintRow.appendChild(deleteButton);

  const editForm = document.createElement('form');
  editForm.className = 'task-edit-form';
  editForm.style.display = 'none';

  let isExpanded = false;

  const toggleEdit = () => {
    isExpanded = !isExpanded;
    editForm.style.display = isExpanded ? 'flex' : 'none';
    li.classList.toggle('expanded', isExpanded);
  };

  label.addEventListener('click', toggleEdit);

  const durationRow = document.createElement('div');
  durationRow.className = 'form-row';

  const hasDurationToggle = createToggle('Duration', blueprint.duration !== undefined);
  const durationPicker = createNumberPicker('days', 1, 365, blueprint.duration || 7);
  durationPicker.element.style.display = blueprint.duration !== undefined ? 'flex' : 'none';

  hasDurationToggle.onChange((enabled) => {
    durationPicker.element.style.display = enabled ? 'flex' : 'none';
  });

  durationRow.appendChild(hasDurationToggle.element);
  durationRow.appendChild(durationPicker.element);

  const recurRow = document.createElement('div');
  recurRow.className = 'form-row';

  const recurToggle = createToggle('Recurring', blueprint.recur);
  recurRow.appendChild(recurToggle.element);

  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.className = 'save-button';
  saveButton.textContent = 'Save';

  editForm.appendChild(durationRow);
  editForm.appendChild(recurRow);
  editForm.appendChild(saveButton);

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (blueprint.id === undefined) return;

    try {
      const hasDuration = hasDurationToggle.getValue();
      const updates: Partial<Blueprint> = {
        recur: recurToggle.getValue(),
      };

      if (hasDuration) {
        updates.duration = durationPicker.getValue();
      } else {
        updates.duration = undefined;
      }

      await updateBlueprint(blueprint.id, updates);
      toggleEdit();
      await onUpdate();
    } catch (error) {
      console.error('Failed to update blueprint:', error);
    }
  });

  createTaskButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (blueprint.id !== undefined) {
      try {
        await addTodoFromBlueprint(blueprint.id);
      } catch (error) {
        console.error('Failed to create task from blueprint:', error);
      }
    }
  });

  deleteButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (blueprint.id !== undefined) {
      try {
        await deleteBlueprint(blueprint.id);
        await onUpdate();
      } catch (error) {
        console.error('Failed to delete blueprint:', error);
      }
    }
  });

  li.appendChild(blueprintRow);
  li.appendChild(editForm);

  return li;
};

