const appEl = document.getElementById('app');

function renderApp() {
  const state = getState();

  document.querySelectorAll('[data-view]').forEach(el => {
    el.classList.toggle('nav-link--active', el.dataset.view === state.currentView);
  });

  switch (state.currentView) {
    case 'dashboard': renderDashboard(appEl); break;
    case 'list':      renderList(appEl);      break;
    case 'form':      renderForm(appEl);      break;
    case 'settings':  renderSettings(appEl);  break;
    default:          renderDashboard(appEl);
  }
}

document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    setState({ currentView: el.dataset.view, editingId: null });
  });
});

setRenderer(renderApp);

async function init() {
  const [transactions, recurring, customCategories, budgets] = await Promise.all([
    getAllTransactions(),
    loadRecurring(),
    loadCustomCategories(),
    loadBudgets(),
  ]);
  initCategories(customCategories);
  const withRecurring = await applyRecurringForMonth(getCurrentYearMonth(), recurring);
  const savedView     = loadCurrentView();
  setState({ transactions: withRecurring, recurring, customCategories, budgets, currentView: savedView });
}

init();
