import type { ViewType } from './types';
import { getState, setState } from './state';
export const createNavigation = (onViewChange: (view: ViewType) => void): HTMLElement => {
  const nav = document.createElement('nav');
  nav.className = 'navigation';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');
  const navItems: { view: ViewType; label: string }[] = [
    { view: 'stack', label: 'Stack' },
    { view: 'blueprints', label: 'Blueprints' },
    { view: 'done', label: 'Done' },
  ];
  navItems.forEach(({ view, label }) => {
    const button = document.createElement('button');
    button.textContent = label;
    button.className = 'nav-item';
    button.setAttribute('data-view', view);
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', view === getState().currentView ? 'true' : 'false');
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');
      setState({ currentView: view });
      onViewChange(view);
    });
    if (view === getState().currentView) {
      button.classList.add('active');
    }
    nav.appendChild(button);
  });
  return nav;
};
