const buttons = document.querySelectorAll('[data-button]');
const result = document.querySelector('.calculadora-result-value');
const error = document.querySelector('.calculadora-error');
const active = 'button-click';

const regexHasNumber = /^[0-9]+$/;
const regexHasSign = /[\/\*\-\+]/;
const regexHasDot = /[\.\,]/;

let value = '0';
let number = null;
let isLastResult = false;

function animaButton({ target }) {
  target.classList.add(active);

  setTimeout(() => {
    target.classList.remove(active);
  }, 100);
}

function checkButton({ target }) {
  console.log(target.dataset.button);
  if (regexHasNumber.test(target.dataset.button)) {
    changeValue('number', target.dataset.button);
  } else if (regexHasSign.test(target.dataset.button)) {
    changeValue('sign', target.dataset.button);
  } else if (regexHasDot.test(target.dataset.button)) {
    changeValue('dot', target.dataset.button);
  } else if (target.dataset.button === 'enter') {
    changeValue('enter', target.dataset.button);
  } else if (target.dataset.button === 'backspace') {
    changeValue('backspace', target.dataset.button);
  }
}

function buttonClickListener() {
  buttons.forEach((button) => {
    button.addEventListener('click', animaButton);
    button.addEventListener('touch', animaButton);
    button.addEventListener('click', checkButton);
    button.addEventListener('touch', checkButton);
  });
}

function updateResult(newValue) {
  value = newValue;
  if (!value || value === '0' || value === 0) value = '0';
  result.innerText = value;
}

function changeValue(type, digit) {
  const lastDigit = value.charAt(value.length - 1);
  switch (type) {
    case 'number':
      if (!value || value === '0' || isLastResult) updateResult(digit);
      else updateResult(value + digit);
      number = number ? number + String(digit) : String(digit);
      isLastResult = false;
      break;
    case 'sign':
      if (!value || value === '0')
        if (digit === '-') updateResult('-');
        else break;
      else if (!regexHasSign.test(lastDigit) && !regexHasDot.test(lastDigit)) updateResult(value + digit);
      else updateResult(value.slice(0, -1) + digit);
      number = null;
      isLastResult = false;
      break;
    case 'dot':
      if (regexHasSign.test(lastDigit) || value === '0' || isLastResult) {
        updateResult(isLastResult || value === '0' ? '0.' : value + '0.');
        number = '0.';
        isLastResult = false;
      } else if (regexHasDot.test(number)) break;
      else {
        updateResult(value + '.');
        number = number ? number + String('.') : String(null);
      }
      break;
    case 'enter':
      updateResult(String(eval(value)));
      isLastResult = true;
      number = null;
      break;
    case 'backspace':
      if (isLastResult) {
        updateResult(0);
        isLastResult = false;
        break;
      }
      updateResult(value.slice(0, -1));
      number = number ? number.slice(0, -1) : '0';
      break;
    default:
      break;
  }
}

function checkKey(e) {
  e.preventDefault();

  let button;

  if (regexHasNumber.test(e.key)) {
    changeValue('number', e.key);
    button = document.querySelector(`[data-button="${e.key}"]`);
  } else if (regexHasSign.test(e.key)) {
    changeValue('sign', e.key);
    button = document.querySelector(`[data-button="${e.key}"]`);
  } else if (regexHasDot.test(e.key)) {
    changeValue('dot', e.key);
    button = document.querySelector(`[data-button="."]`);
  } else if (e.key === 'Enter') {
    changeValue('enter', e.key);
    button = document.querySelector(`[data-button="="]`);
  } else if (e.key === 'Backspace') {
    button = document.querySelector(`[data-button="backspace"]`);
    changeValue('backspace', e.key);
  }

  if (button) animaButton({ target: button });
}

function keyPress() {
  const key = window.addEventListener('keydown', checkKey);
}

buttonClickListener();
// buttonPress();
keyPress();
updateResult(value);
