import Dexie, { type EntityTable } from 'dexie';

export interface TodoItem {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

const db = new Dexie('HyperstackDB') as Dexie & {
  todos: EntityTable<TodoItem, 'id'>;
};

db.version(1).stores({
  todos: '++id, completed, createdAt, completedAt',
});

export { db };

