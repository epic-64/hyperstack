import Dexie, { type EntityTable } from 'dexie';

export interface TodoItem {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

class HyperstackDB extends Dexie {
  todos!: EntityTable<TodoItem, 'id'>;

  constructor() {
    super('HyperstackDB');
    this.version(1).stores({
      todos: '++id, completed, createdAt, completedAt',
    });
  }
}

export const db = new HyperstackDB();

