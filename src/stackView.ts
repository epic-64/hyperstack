import type { TodoItem } from './db';
import { addTodo, toggleTodo, deleteTodo, getActiveTodos } from './todos';
import { celebrate } from './celebration';

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

  const label = document.createElement('span');
  label.className = 'todo-label';
  label.textContent = todo.title;

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

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.textContent = '×';
  deleteButton.setAttribute('aria-label', `Delete "${todo.title}"`);

  popButton.addEventListener('click', async () => {
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

  deleteButton.addEventListener('click', async () => {
    if (todo.id !== undefined) {
      try {
        await deleteTodo(todo.id);
        await onUpdate();
      } catch (error) {
        console.error('Failed to delete todo:', error);
      }
    }
  });

  li.appendChild(label);
  if (todo.duration !== undefined && todo.endDate !== undefined) {
    li.appendChild(durationBadge);
  }
  li.appendChild(popButton);
  li.appendChild(deleteButton);

  return li;
};

