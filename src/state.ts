import type { ViewType } from './types';

export interface AppState {
  currentView: ViewType;
}

let state: AppState = {
  currentView: 'stack',
};

export const getState = (): AppState => state;

export const setState = (newState: Partial<AppState>): void => {
  state = { ...state, ...newState };
};

