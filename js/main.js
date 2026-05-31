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
  const transactions = await getAllTransactions();
  const savedView    = loadCurrentView();
  setState({ transactions, currentView: savedView });
}

init();
