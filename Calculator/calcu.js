const exprEl = document.getElementById('expr');
const resultEl = document.getElementById('result');
const keys = document.getElementById('keys');
const historyEl = document.getElementById('history');
const clearBtn = document.getElementById('clearBtn');
const delBtn = document.getElementById('delBtn');
const modeBtn = document.getElementById('modeBtn');
const equalsBtn = document.getElementById('equals');

let expression = '';
let history = [];

function factorial(n) {
  n = Number(n);
  if (!Number.isInteger(n) || n < 0) return NaN;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function prepareExpression(raw) {
  let s = String(raw);
  s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  s = s.replace(/\^/g, '**');
  s = s.replace(/(\d+(\.\d+)?)!/g, 'factorial($1)');
  s = s.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
  return s;
}

function evaluateExpression(raw) {
  const s = prepareExpression(raw);
  try {
    const func = new Function('factorial', 'Math', `return ${s};`);
    return func(factorial, Math);
  } catch {
    throw new Error('Invalid Expression');
  }
}

function render() {
  exprEl.textContent = expression || '0';
  try {
    const val = expression ? evaluateExpression(expression) : 0;
    resultEl.textContent = val ?? 'Error';
  } catch {
    resultEl.textContent = 'Error';
  }
  renderHistory();
}

function renderHistory() {
  historyEl.innerHTML = '';
  if (history.length === 0) {
    historyEl.innerHTML = '<div>No history yet</div>';
    return;
  }
  [...history].reverse().slice(0, 10).forEach(item => {
    const it = document.createElement('div');
    it.className = 'item';
    it.innerHTML = `<strong>${item.expr}</strong> = ${item.res}`;
    it.addEventListener('click', () => {
      expression = item.expr;
      render();
    });
    historyEl.appendChild(it);
  });
}

function appendValue(v) {
  if (v === 'clear') {
    expression = '';
    render();
    return;
  }
  expression += v;
  render();
}

function calculate() {
  if (!expression) return;
  try {
    const res = evaluateExpression(expression);
    history.push({ expr: expression, res });
    if (history.length > 50) history.shift();
    expression = String(res);
    render();
  } catch {
    resultEl.textContent = 'Error';
  }
}

function backspace() {
  expression = expression.slice(0, -1);
  render();
}

keys.addEventListener('click', e => {
  const key = e.target.closest('.key');
  if (!key) return;
  const v = key.dataset.value;
  if (v === 'clear') return (expression = ''), render();
  if (key.id === 'equals' || v === '=') return calculate();
  appendValue(v);
});

clearBtn.addEventListener('click', () => (expression = '', render()));
delBtn.addEventListener('click', () => backspace());
equalsBtn.addEventListener('click', () => calculate());
modeBtn.addEventListener('click', () => {
  const body = document.body;
  const cur = body.getAttribute('data-theme');
  body.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
});

window.addEventListener('keydown', e => {
  const allowed = '0123456789.+-*/()%^';
  if (allowed.includes(e.key)) {
    e.preventDefault();
    appendValue(e.key);
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    calculate();
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    backspace();
  } else if (e.key === 'Escape') {
    expression = '';
    render();
  }
});

render();
