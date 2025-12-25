import { db, type Blueprint } from './db';

export const addBlueprint = async (
  title: string,
  duration?: number,
  recur: boolean = false
): Promise<void> => {
  await db.blueprints.add({
    title,
    duration,
    recur,
    createdAt: Date.now(),
  });
};

export const updateBlueprint = async (
  id: number,
  updates: Partial<Omit<Blueprint, 'id' | 'createdAt'>>
): Promise<void> => {
  await db.blueprints.update(id, updates);
};

export const deleteBlueprint = async (id: number): Promise<void> => {
  await db.blueprints.delete(id);
};

export const getBlueprints = async (): Promise<Blueprint[]> => {
  return await db.blueprints.orderBy('createdAt').toArray();
};

export const getBlueprint = async (id: number): Promise<Blueprint | undefined> => {
  return await db.blueprints.get(id);
};

