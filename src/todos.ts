import { db, type TodoItem } from './db';

export const addTodo = async (title: string): Promise<void> => {
  await db.todos.add({
    title,
    completed: false,
    createdAt: Date.now(),
  });
};

export const toggleTodo = async (id: number): Promise<void> => {
  const todo = await db.todos.get(id);
  if (!todo) return;

  await db.todos.update(id, {
    completed: !todo.completed,
    completedAt: !todo.completed ? Date.now() : undefined,
  });
};

export const deleteTodo = async (id: number): Promise<void> => {
  await db.todos.delete(id);
};

export const getActiveTodos = async (): Promise<TodoItem[]> => {
  const todos = await db.todos.orderBy('createdAt').toArray();
  return todos.filter(todo => !todo.completed);
};

export const getCompletedTodos = async (): Promise<TodoItem[]> => {
  const todos = await db.todos.orderBy('completedAt').reverse().toArray();
  return todos.filter(todo => todo.completed);
};

