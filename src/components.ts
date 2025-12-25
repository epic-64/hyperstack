export const createNumberPicker = (
  label: string,
  min: number = 1,
  max: number = 999,
  initialValue: number = 1
): { element: HTMLElement; getValue: () => number } => {
  const container = document.createElement('div');
  container.className = 'number-picker';

  const labelElement = document.createElement('span');
  labelElement.className = 'number-picker-label';
  labelElement.textContent = label;

  const decrementButton = document.createElement('button');
  decrementButton.type = 'button';
  decrementButton.className = 'number-picker-button';
  decrementButton.textContent = '−';
  decrementButton.setAttribute('aria-label', `Decrease ${label}`);

  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'number-picker-value';
  valueDisplay.textContent = initialValue.toString();

  const incrementButton = document.createElement('button');
  incrementButton.type = 'button';
  incrementButton.className = 'number-picker-button';
  incrementButton.textContent = '+';
  incrementButton.setAttribute('aria-label', `Increase ${label}`);

  let currentValue = initialValue;

  const updateValue = (newValue: number) => {
    currentValue = Math.max(min, Math.min(max, newValue));
    valueDisplay.textContent = currentValue.toString();
    decrementButton.disabled = currentValue <= min;
    incrementButton.disabled = currentValue >= max;
  };

  decrementButton.addEventListener('click', () => {
    updateValue(currentValue - 1);
  });

  incrementButton.addEventListener('click', () => {
    updateValue(currentValue + 1);
  });

  updateValue(initialValue);

  container.appendChild(labelElement);
  container.appendChild(decrementButton);
  container.appendChild(valueDisplay);
  container.appendChild(incrementButton);

  return {
    element: container,
    getValue: () => currentValue,
  };
};

export const createToggle = (
  label: string,
  initialValue: boolean = false
): { element: HTMLElement; getValue: () => boolean; onChange: (callback: (value: boolean) => void) => void } => {
  const container = document.createElement('div');
  container.className = 'toggle-container';

  const labelElement = document.createElement('span');
  labelElement.className = 'toggle-label';
  labelElement.textContent = label;

  const toggleWrapper = document.createElement('label');
  toggleWrapper.className = 'toggle-switch';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'toggle-input';
  checkbox.checked = initialValue;

  const slider = document.createElement('span');
  slider.className = 'toggle-slider';

  toggleWrapper.appendChild(checkbox);
  toggleWrapper.appendChild(slider);

  container.appendChild(labelElement);
  container.appendChild(toggleWrapper);

  const callbacks: ((value: boolean) => void)[] = [];

  checkbox.addEventListener('change', () => {
    callbacks.forEach(cb => cb(checkbox.checked));
  });

  return {
    element: container,
    getValue: () => checkbox.checked,
    onChange: (callback) => {
      callbacks.push(callback);
    },
  };
};

