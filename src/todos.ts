import { db, type TodoItem } from './db';
import { getBlueprint } from './blueprints';

const computeEndDate = (startDate: number, duration: number): number => {
  return startDate + duration * 24 * 60 * 60 * 1000;
};

export const addTodo = async (title: string): Promise<void> => {
  await db.todos.add({
    title,
    completed: false,
    createdAt: Date.now(),
  });
};

export const addTodoFromBlueprint = async (blueprintId: number): Promise<void> => {
  const blueprint = await getBlueprint(blueprintId);
  if (!blueprint) return;

  const startDate = Date.now();
  const todo: Omit<TodoItem, 'id'> = {
    title: blueprint.title,
    completed: false,
    createdAt: Date.now(),
    blueprintId,
    startDate,
    duration: blueprint.duration,
  };

  if (blueprint.duration !== undefined) {
    todo.endDate = computeEndDate(startDate, blueprint.duration);
  }

  await db.todos.add(todo);
};

export const updateTodo = async (
  id: number,
  updates: Partial<Omit<TodoItem, 'id' | 'createdAt'>>
): Promise<void> => {
  const todo = await db.todos.get(id);
  if (!todo) return;

  const updatedTodo = { ...updates };

  if (updates.startDate !== undefined && updates.duration !== undefined) {
    updatedTodo.endDate = computeEndDate(updates.startDate, updates.duration);
  } else if (updates.startDate !== undefined && todo.duration !== undefined) {
    updatedTodo.endDate = computeEndDate(updates.startDate, todo.duration);
  } else if (updates.duration !== undefined && todo.startDate !== undefined) {
    updatedTodo.endDate = computeEndDate(todo.startDate, updates.duration);
  }

  if (updates.duration === undefined && todo.duration !== undefined && updates.startDate === undefined) {
    updatedTodo.endDate = undefined;
  }

  await db.todos.update(id, updatedTodo);
};

export const toggleTodo = async (id: number): Promise<void> => {
  const todo = await db.todos.get(id);
  if (!todo) return;

  const wasCompleted = todo.completed;
  const isNowCompleted = !wasCompleted;

  await db.todos.update(id, {
    completed: isNowCompleted,
    completedAt: isNowCompleted ? Date.now() : undefined,
  });

  if (isNowCompleted && todo.blueprintId) {
    const blueprint = await getBlueprint(todo.blueprintId);
    if (blueprint?.recur) {
      await addTodoFromBlueprint(todo.blueprintId);
    }
  }
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

