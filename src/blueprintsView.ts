export const createBlueprintsView = (): HTMLElement => {
  const container = document.createElement('div');
  container.className = 'view-container blueprints-view';

  const header = document.createElement('div');
  header.className = 'view-header';

  const title = document.createElement('h1');
  title.textContent = 'Blueprints';
  header.appendChild(title);

  const emptyState = document.createElement('p');
  emptyState.className = 'empty-state';
  emptyState.textContent = 'Blueprints feature coming soon...';

  container.appendChild(header);
  container.appendChild(emptyState);

  return container;
};

