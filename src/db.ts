import Dexie, { type EntityTable } from 'dexie';

export interface Blueprint {
  id?: number;
  title: string;
  duration?: number;
  recur: boolean;
  createdAt: number;
}

export interface TodoItem {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  blueprintId?: number;
  startDate?: number;
  duration?: number;
  endDate?: number;
}

class HyperstackDB extends Dexie {
  todos!: EntityTable<TodoItem, 'id'>;
  blueprints!: EntityTable<Blueprint, 'id'>;

  constructor() {
    super('HyperstackDB');
    this.version(1).stores({
      todos: '++id, completed, createdAt, completedAt',
    });
    this.version(2).stores({
      todos: '++id, completed, createdAt, completedAt, blueprintId, startDate',
      blueprints: '++id, createdAt',
    });
  }
}

export const db = new HyperstackDB();

