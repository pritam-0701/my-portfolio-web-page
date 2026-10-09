const form = document.getElementById('expenseForm');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const expenseList = document.getElementById('expenseList');
const emptyState = document.getElementById('emptyState');
const filterCategory = document.getElementById('filterCategory');
const formMessage = document.getElementById('formMessage');

const STORAGE_KEY = 'expenseTrackerEntriesV1';
const icons = {
  Food: '🍜', Transport: '🚌', Shopping: '🛍️', Bills: '🧾',
  Education: '📚', Health: '💊', Entertainment: '🎬', Other: '💳'
};

let expenses = loadExpenses();

function localDateString(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

dateInput.value = localDateString();
dateInput.max = localDateString();
document.getElementById('todayLabel').textContent =
  new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

function loadExpenses() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function money(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2
  }).format(value);
}

function render() {
  const selectedCategory = filterCategory.value;
  const filtered = expenses
    .filter(item => selectedCategory === 'All' || item.category === selectedCategory)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const now = new Date();
  const monthTotal = expenses
    .filter(item => {
      const d = new Date(item.date + 'T12:00:00');
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, item) => sum + item.amount, 0);

  document.getElementById('totalAmount').textContent = money(total);
  document.getElementById('monthAmount').textContent = money(monthTotal);
  document.getElementById('transactionCount').textContent = expenses.length;
  document.getElementById('shownCount').textContent =
    `${filtered.length} ${filtered.length === 1 ? 'expense' : 'expenses'}`;

  expenseList.innerHTML = '';
  emptyState.style.display = filtered.length ? 'none' : 'block';

  filtered.forEach(item => {
    const row = document.createElement('article');
    row.className = 'expense-item';

    const icon = document.createElement('div');
    icon.className = 'category-icon';
    icon.textContent = icons[item.category] || icons.Other;

    const info = document.createElement('div');
    info.className = 'expense-info';
    const name = document.createElement('h3');
    name.textContent = item.title;
    const meta = document.createElement('p');
    meta.textContent = `${item.category} · ${new Date(item.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    info.append(name, meta);

    const right = document.createElement('div');
    right.className = 'expense-right';
    const amount = document.createElement('div');
    amount.className = 'expense-amount';
    amount.textContent = `− ${money(item.amount)}`;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-btn';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${item.title}`);
    remove.addEventListener('click', () => deleteExpense(item.id));
    right.append(amount, remove);

    row.append(icon, info, right);
    expenseList.append(row);
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;

  if (!title || !Number.isFinite(amount) || amount <= 0 || !date) {
    formMessage.textContent = 'Please enter a name, valid amount and date.';
    return;
  }

  expenses.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    amount: Math.round(amount * 100) / 100,
    category: categoryInput.value,
    date,
    createdAt: Date.now()
  });

  saveExpenses();
  render();
  form.reset();
  dateInput.value = localDateString();
  formMessage.textContent = 'Expense added successfully!';
  titleInput.focus();
});

function deleteExpense(id) {
  expenses = expenses.filter(item => item.id !== id);
  saveExpenses();
  render();
}

filterCategory.addEventListener('change', render);

document.getElementById('clearAllBtn').addEventListener('click', () => {
  if (!expenses.length) {
    formMessage.textContent = 'There are no expenses to clear.';
    return;
  }
  if (confirm('Delete all recorded expenses? This cannot be undone.')) {
    expenses = [];
    saveExpenses();
    render();
    formMessage.textContent = 'All expenses cleared.';
  }
});

render();
