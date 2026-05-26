function renderDashboard(container) {
  const state = getState();
  const ym    = state.currentYearMonth;

  const monthTxs = state.transactions.filter(t => t.date.startsWith(ym));
  const summary  = calcSummary(monthTxs);

  const recent = monthTxs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">${formatYearMonth(ym)}</h1>
        <div class="month-nav">
          <button class="btn btn--ghost" id="btn-prev-month">＜</button>
          <button class="btn btn--ghost" id="btn-next-month">＞</button>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card summary-card--income">
          <div class="summary-label">収入</div>
          <div class="summary-amount">${formatAmount(summary.income)}</div>
        </div>
        <div class="summary-card summary-card--expense">
          <div class="summary-label">支出</div>
          <div class="summary-amount">${formatAmount(summary.expense)}</div>
        </div>
        <div class="summary-card summary-card--asset">
          <div class="summary-label">資産</div>
          <div class="summary-amount">${formatAmount(summary.asset)}</div>
        </div>
        <div class="summary-card summary-card--balance">
          <div class="summary-label">差引残高</div>
          <div class="summary-amount${summary.balance < 0 ? ' text-danger' : ''}">
            ${formatAmount(summary.balance)}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">直近の取引</h2>
          <button class="btn btn--text" id="btn-view-all">すべて見る</button>
        </div>
        ${recent.length === 0
          ? '<p class="empty-text">今月の取引はまだありません</p>'
          : `<ul class="tx-list">${recent.map(renderTxItem).join('')}</ul>`}
      </div>
    </div>
  `;

  document.getElementById('btn-prev-month').addEventListener('click', () => {
    setState({ currentYearMonth: getPrevMonth(ym) });
  });
  document.getElementById('btn-next-month').addEventListener('click', () => {
    setState({ currentYearMonth: getNextMonth(ym) });
  });

  document.getElementById('btn-view-all').addEventListener('click', () => {
    setState({ currentView: 'list' });
  });

  container.querySelectorAll('.tx-item[data-id]').forEach(el => {
    el.addEventListener('click', () => {
      setState({ currentView: 'form', editingId: el.dataset.id });
    });
  });
}

// 取引1件分の <li> HTML を返す（ダッシュボード・一覧で共用）
function renderTxItem(tx) {
  const cat = getCategoryById(tx.categoryId);
  return `
    <li class="tx-item tx-item--${tx.type}" data-id="${tx.id}">
      <span class="tx-icon">${cat ? cat.icon : '📌'}</span>
      <div class="tx-info">
        <span class="tx-name">${cat ? cat.name : escapeHtml(tx.categoryId)}</span>
        <span class="tx-date">${formatDate(tx.date)}</span>
      </div>
      <span class="tx-amount tx-amount--${tx.type}">${formatAmount(tx.amount)}</span>
    </li>
  `;
}
