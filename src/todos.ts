import { db, type TodoItem } from './db';

export const addTodo = async (title: string): Promise<number> => {
  const id = await db.todos.add({
    title,
    completed: false,
    createdAt: Date.now(),
  });
  return id;
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
  return await db.todos.where('completed').equals(0).sortBy('createdAt');
};

export const getCompletedTodos = async (): Promise<TodoItem[]> => {
  return await db.todos.where('completed').equals(1).reverse().sortBy('completedAt');
};

