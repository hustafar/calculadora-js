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

let errors = [
  {
    regex: /^-$/,
    message: 'Não é possível calcular apenas o sinal negativo',
  },
  {
    regex: /[\/\*\-\+]$/,
    message: 'Não é possível calcular com sinal no termino da expressão',
  },
  {
    regex: /.*\/0([^.]|$|\.(0{4,}.*|0{1,4}([^0-9]|$))).*/, // achado na internet
    message: 'Não é possível dividir por 0',
  },
];

// Atualiza variável value
function updateResult(newValue) {
  value = newValue;
  if (!value || value === '0' || value === 0) value = '0';
  result.innerText = value;
}

// Adiciona e coloca um tempo para remover a classe de animação de click
function animaButton({ target }) {
  target.classList.add(active);

  setTimeout(() => {
    target.classList.remove(active);
  }, 100);
}

// Checa value atual e caso encontre algum erro predefinido retorna ele
function catchErrors() {
  let tempErr = false;
  error.innerText = '';
  for (i = 0; i < errors.length; i++) {
    if (errors[i].regex.test(value)) {
      tempErr = errors[i].message;
      break;
    }
  }
  return tempErr;
}

// Verifica condições para digito e caso caia em alguma condição ele atualiza a variável value e number de acordo
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
      if (!value || value === '0' || value === '-')
        if (digit === '-') updateResult('-');
        else break;
      else if (!regexHasSign.test(lastDigit) && !regexHasDot.test(lastDigit)) updateResult(value + digit);
      else {
        const penulDigit = value.charAt(value.length - 2);
        if (digit === '/' || digit === '*') {
          if (penulDigit === '/' || penulDigit === '*') updateResult(value.slice(0, -2) + digit);
          else updateResult(value.slice(0, -1) + digit);
        } else {
          if (penulDigit === '/' || penulDigit === '*') updateResult(value.slice(0, -1) + digit);
          else updateResult(value + digit);
        }
      }
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
      const errorCalc = catchErrors();
      console.log(errorCalc);
      if (!errorCalc) {
        updateResult(String(eval(value)));
        isLastResult = true;
        number = null;
      } else error.innerText = errorCalc;
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

// Checa que tipo de evento que o botão teve e altera seu valor
function checkButton({ target }) {
  if (regexHasNumber.test(target.dataset.button)) {
    changeValue('number', target.dataset.button);
  } else if (regexHasSign.test(target.dataset.button)) {
    changeValue('sign', target.dataset.button);
  } else if (regexHasDot.test(target.dataset.button)) {
    changeValue('dot', target.dataset.button);
  } else if (target.dataset.button === 'Enter') {
    changeValue('enter', target.dataset.button);
  } else if (target.dataset.button === 'backspace') {
    changeValue('backspace', target.dataset.button);
  }
}

// Adiciona listener para animação e checagem nos botões
function buttonClickListener() {
  buttons.forEach((button) => {
    button.addEventListener('click', animaButton);
    button.addEventListener('click', checkButton);
    button.addEventListener('touch', animaButton);
    button.addEventListener('touch', checkButton);
  });
}

// Checa que tipo de evento que a tecla pressionada teve, aciona animação e chama a função para verificar se o digito é permitido
function checkKey(e) {
  if (!/F\d/.test(e.key)) e.preventDefault();
  else return;

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

// Adiciona Listener para verificação de tecla
function keyPress() {
  const key = window.addEventListener('keydown', checkKey);
}

// Chama as funções de adição de evento e atualiza o valor value para ser compatível com seu valor inicial
buttonClickListener();
keyPress();
updateResult(value);
