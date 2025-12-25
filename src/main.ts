import { getState } from './state';
import { createNavigation } from './navigation';
import { createStackView } from './stackView';
import { createBlueprintsView } from './blueprintsView';
import { createDoneView } from './doneView';

const initApp = async (): Promise<void> => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = '';

  const nav = createNavigation(handleViewChange);
  app.appendChild(nav);

  const viewContainer = document.createElement('div');
  viewContainer.id = 'view-container';
  app.appendChild(viewContainer);

  await renderCurrentView();
};

const renderCurrentView = async (): Promise<void> => {
  const viewContainer = document.getElementById('view-container');
  if (!viewContainer) return;

  const currentView = getState().currentView;
  let view: HTMLElement;

  switch (currentView) {
    case 'stack':
      view = await createStackView();
      break;
    case 'blueprints':
      view = createBlueprintsView();
      break;
    case 'done':
      view = await createDoneView();
      break;
    default:
      view = await createStackView();
  }

  viewContainer.innerHTML = '';
  viewContainer.appendChild(view);
};

const handleViewChange = async (): Promise<void> => {
  await renderCurrentView();
};

initApp();

