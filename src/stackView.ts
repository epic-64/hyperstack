import type { TodoItem } from './db';
import { addTodo, toggleTodo, getActiveTodos, updateTodo } from './todos';
import { celebrate } from './celebration';
import { createNumberPicker, createToggle } from './components';

export const createStackView = async (): Promise<HTMLElement> => {
  const container = document.createElement('div');
  container.className = 'view-container stack-view';

  const header = document.createElement('div');
  header.className = 'view-header';

  const title = document.createElement('h1');
  title.textContent = 'Stack';
  header.appendChild(title);

  const form = document.createElement('form');
  form.className = 'add-todo-form';
  form.setAttribute('aria-label', 'Add new todo');

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'todo-input';
  input.placeholder = 'What needs to be done?';
  input.setAttribute('aria-label', 'New todo title');
  input.required = true;

  const addButton = document.createElement('button');
  addButton.type = 'submit';
  addButton.textContent = '+';
  addButton.className = 'add-button';
  addButton.setAttribute('aria-label', 'Add todo');

  form.appendChild(input);
  form.appendChild(addButton);

  const todoList = document.createElement('ul');
  todoList.className = 'todo-list';
  todoList.setAttribute('role', 'list');

  const renderTodos = async () => {
    const todos = await getActiveTodos();
    todoList.innerHTML = '';

    if (todos.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No tasks yet. Add one above!';
      todoList.appendChild(emptyState);
      return;
    }

    todos.forEach((todo) => {
      const li = createTodoItem(todo, renderTodos);
      todoList.appendChild(li);
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const titleText = input.value.trim();
    if (!titleText) return;

    try {
      await addTodo(titleText);
      input.value = '';
      await renderTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  });

  header.appendChild(form);
  container.appendChild(header);
  container.appendChild(todoList);

  await renderTodos();

  return container;
};

const createTodoItem = (todo: TodoItem, onUpdate: () => Promise<void>): HTMLElement => {
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.setAttribute('role', 'listitem');

  const taskRow = document.createElement('div');
  taskRow.className = 'task-row';

  const label = document.createElement('span');
  label.className = 'todo-label';
  label.textContent = todo.title;
  label.style.cursor = 'pointer';

  const durationBadge = document.createElement('span');
  durationBadge.className = 'duration-badge';
  if (todo.duration !== undefined && todo.endDate !== undefined) {
    const endDate = new Date(todo.endDate);
    const today = new Date();
    const isOverdue = endDate < today && !todo.completed;
    durationBadge.textContent = `${todo.duration}d → ${endDate.toLocaleDateString()}`;
    if (isOverdue) {
      durationBadge.style.color = 'rgba(255, 100, 100, 0.9)';
      durationBadge.style.borderColor = 'rgba(255, 100, 100, 0.5)';
    }
  }

  const popButton = document.createElement('button');
  popButton.className = 'pop-button';
  popButton.textContent = 'Pop';
  popButton.setAttribute('aria-label', `Complete "${todo.title}"`);

  taskRow.appendChild(label);
  if (todo.duration !== undefined && todo.endDate !== undefined) {
    taskRow.appendChild(durationBadge);
  }
  taskRow.appendChild(popButton);

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

  const startDateRow = document.createElement('div');
  startDateRow.className = 'form-row';

  const startDateLabel = document.createElement('label');
  startDateLabel.className = 'edit-label';
  startDateLabel.textContent = 'Start Date:';

  const startDateInput = document.createElement('input');
  startDateInput.type = 'date';
  startDateInput.className = 'date-input';
  if (todo.startDate) {
    const date = new Date(todo.startDate);
    startDateInput.value = date.toISOString().split('T')[0];
  }

  startDateRow.appendChild(startDateLabel);
  startDateRow.appendChild(startDateInput);

  const durationRow = document.createElement('div');
  durationRow.className = 'form-row';

  const hasDurationToggle = createToggle('Duration', todo.duration !== undefined);
  const durationPicker = createNumberPicker('days', 1, 365, todo.duration || 7);
  durationPicker.element.style.display = todo.duration !== undefined ? 'flex' : 'none';

  hasDurationToggle.onChange((enabled) => {
    durationPicker.element.style.display = enabled ? 'flex' : 'none';
  });

  durationRow.appendChild(hasDurationToggle.element);
  durationRow.appendChild(durationPicker.element);

  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.className = 'save-button';
  saveButton.textContent = 'Save';

  editForm.appendChild(startDateRow);
  editForm.appendChild(durationRow);
  editForm.appendChild(saveButton);

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (todo.id === undefined) return;

    try {
      const hasDuration = hasDurationToggle.getValue();
      const updates: Partial<TodoItem> = {};

      if (startDateInput.value) {
        updates.startDate = new Date(startDateInput.value).getTime();
      }

      if (hasDuration) {
        updates.duration = durationPicker.getValue();
      } else {
        updates.duration = undefined;
        updates.endDate = undefined;
      }

      await updateTodo(todo.id, updates);
      toggleEdit();
      await onUpdate();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  });

  popButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (todo.id !== undefined) {
      try {
        await toggleTodo(todo.id);
        celebrate(li);
        await onUpdate();
      } catch (error) {
        console.error('Failed to complete todo:', error);
      }
    }
  });

  li.appendChild(taskRow);
  li.appendChild(editForm);

  return li;
};

