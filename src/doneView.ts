import type { TodoItem } from './db';
import { deleteTodo, getCompletedTodos } from './todos';

export const createDoneView = async (): Promise<HTMLElement> => {
  const container = document.createElement('div');
  container.className = 'view-container done-view';

  const title = document.createElement('h1');
  title.textContent = 'Done';

  const todoList = document.createElement('ul');
  todoList.className = 'todo-list done-list';
  todoList.setAttribute('role', 'list');

  const renderTodos = async () => {
    const todos = await getCompletedTodos();
    todoList.innerHTML = '';

    if (todos.length === 0) {
      const emptyState = document.createElement('li');
      emptyState.className = 'empty-state';
      emptyState.textContent = 'No completed tasks yet.';
      todoList.appendChild(emptyState);
      return;
    }

    todos.forEach((todo) => {
      const li = createCompletedTodoItem(todo, renderTodos);
      todoList.appendChild(li);
    });
  };

  container.appendChild(title);
  container.appendChild(todoList);

  await renderTodos();

  return container;
};

const createCompletedTodoItem = (todo: TodoItem, onUpdate: () => Promise<void>): HTMLElement => {
  const li = document.createElement('li');
  li.className = 'todo-item completed';
  li.setAttribute('role', 'listitem');

  const label = document.createElement('span');
  label.className = 'todo-label';
  label.textContent = todo.title;

  const completedDate = document.createElement('span');
  completedDate.className = 'completed-date';
  if (todo.completedAt) {
    const date = new Date(todo.completedAt);
    completedDate.textContent = date.toLocaleDateString();
  }

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.textContent = '×';
  deleteButton.setAttribute('aria-label', `Delete "${todo.title}"`);

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
  li.appendChild(completedDate);
  li.appendChild(deleteButton);

  return li;
};

