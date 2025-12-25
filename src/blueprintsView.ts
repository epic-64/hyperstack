import type { Blueprint } from './db';
import {
  addBlueprint,
  deleteBlueprint,
  getBlueprints,
} from './blueprints';
import { addTodoFromBlueprint } from './todos';

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

  const durationInput = document.createElement('input');
  durationInput.type = 'number';
  durationInput.className = 'duration-input';
  durationInput.placeholder = 'Days';
  durationInput.setAttribute('aria-label', 'Duration in days');
  durationInput.min = '1';

  const recurCheckbox = document.createElement('input');
  recurCheckbox.type = 'checkbox';
  recurCheckbox.className = 'recur-checkbox';
  recurCheckbox.id = 'new-blueprint-recur';

  const recurLabel = document.createElement('label');
  recurLabel.htmlFor = 'new-blueprint-recur';
  recurLabel.className = 'recur-label';
  recurLabel.textContent = '↻';
  recurLabel.title = 'Recurring';

  const addButton = document.createElement('button');
  addButton.type = 'submit';
  addButton.textContent = '+';
  addButton.className = 'add-button';
  addButton.setAttribute('aria-label', 'Add blueprint');

  form.appendChild(titleInput);
  form.appendChild(durationInput);
  form.appendChild(recurLabel);
  form.appendChild(recurCheckbox);
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
      const duration = durationInput.value ? parseInt(durationInput.value) : undefined;
      await addBlueprint(titleText, duration, recurCheckbox.checked);
      titleInput.value = '';
      durationInput.value = '';
      recurCheckbox.checked = false;
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

