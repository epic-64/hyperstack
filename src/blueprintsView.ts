import type { Blueprint } from './db';
import {
  addBlueprint,
  deleteBlueprint,
  getBlueprints,
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
  form.className = 'add-blueprint-form';
  form.setAttribute('aria-label', 'Add new blueprint');

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'todo-input';
  titleInput.placeholder = 'Blueprint title...';
  titleInput.setAttribute('aria-label', 'Blueprint title');
  titleInput.required = true;

  const titleRow = document.createElement('div');
  titleRow.className = 'form-row';
  titleRow.appendChild(titleInput);

  const optionsRow = document.createElement('div');
  optionsRow.className = 'form-row form-options';

  const hasDurationToggle = createToggle('Duration', false);
  const durationPicker = createNumberPicker('days', 1, 365, 7);
  durationPicker.element.style.display = 'none';

  hasDurationToggle.onChange((enabled) => {
    durationPicker.element.style.display = enabled ? 'flex' : 'none';
  });

  const recurToggle = createToggle('Recurring', false);

  const addButton = document.createElement('button');
  addButton.type = 'submit';
  addButton.textContent = '+';
  addButton.className = 'add-button';
  addButton.setAttribute('aria-label', 'Add blueprint');

  optionsRow.appendChild(hasDurationToggle.element);
  optionsRow.appendChild(durationPicker.element);
  optionsRow.appendChild(recurToggle.element);
  optionsRow.appendChild(addButton);

  form.appendChild(titleRow);
  form.appendChild(optionsRow);

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
      const hasDuration = hasDurationToggle.getValue();
      const duration = hasDuration ? durationPicker.getValue() : undefined;
      const recur = recurToggle.getValue();

      await addBlueprint(titleText, duration, recur);
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

  const label = document.createElement('span');
  label.className = 'todo-label';
  label.textContent = blueprint.title;

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

  createTaskButton.addEventListener('click', async () => {
    if (blueprint.id !== undefined) {
      try {
        await addTodoFromBlueprint(blueprint.id);
      } catch (error) {
        console.error('Failed to create task from blueprint:', error);
      }
    }
  });

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.textContent = '×';
  deleteButton.setAttribute('aria-label', `Delete "${blueprint.title}"`);

  deleteButton.addEventListener('click', async () => {
    if (blueprint.id !== undefined) {
      try {
        await deleteBlueprint(blueprint.id);
        await onUpdate();
      } catch (error) {
        console.error('Failed to delete blueprint:', error);
      }
    }
  });

  li.appendChild(label);
  if (blueprint.duration !== undefined) {
    li.appendChild(durationBadge);
  }
  if (blueprint.recur) {
    li.appendChild(recurBadge);
  }
  li.appendChild(createTaskButton);
  li.appendChild(deleteButton);

  return li;
};

