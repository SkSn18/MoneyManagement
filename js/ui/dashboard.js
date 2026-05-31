function renderDashboard(container) {
  const state  = getState();
  const ym     = state.currentYearMonth;
  const mode   = state.displayMode || 'monthly';
  const allTxs = state.transactions;

  // モードごとに表示対象のデータを決定
  let displayTxs, summary, titleText, chartYm, barCount;

  if (mode === 'monthly') {
    displayTxs = allTxs.filter(t => t.date.startsWith(ym));
    summary    = calcSummary(displayTxs);
    titleText  = formatYearMonth(ym);
    chartYm    = ym;
    barCount   = 12;
  } else if (mode === 'yearly') {
    const curYm   = getCurrentYearMonth();
    const ymSet   = new Set(calcMonthlySummary(allTxs, curYm, 12).map(m => m.ym));
    displayTxs = allTxs.filter(t => ymSet.has(t.date.slice(0, 7)));
    summary    = calcSummary(displayTxs);
    titleText  = '直近12ヶ月';
    chartYm    = curYm;
    barCount   = 12;
  } else {
    displayTxs = allTxs;
    summary    = calcSummary(allTxs);
    titleText  = '全期間';
    chartYm    = getCurrentYearMonth();
    barCount   = Math.max(getMonthRange(allTxs).length, 1);
  }

  const recent = displayTxs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // 年・月プルダウン（単月モードのみ表示、新しい順）
  const monthRange    = getMonthRange(allTxs).slice().reverse();
  const selYear       = ym.slice(0, 4);
  const selMonth      = ym.slice(5);
  const years         = [...new Set(monthRange.map(m => m.slice(0, 4)))];
  const monthsForYear = monthRange.filter(m => m.startsWith(selYear));

  const yearOpts = years.map(y =>
    `<option value="${y}"${y === selYear ? ' selected' : ''}>${y}年</option>`
  ).join('');
  const monthOpts = monthsForYear.map(m => {
    const mo = m.slice(5);
    return `<option value="${mo}"${mo === selMonth ? ' selected' : ''}>${parseInt(mo)}月</option>`;
  }).join('');

  const barTitle = mode === 'cumulative' ? '月次収支（全期間）' : '月次収支（直近12ヶ月）';

  // chart canvas を保持して DOM の連続性を維持（Chart.update() による再描画のため）
  const existingPieCanvas = container.querySelector('#chart-expense-pie');
  const existingBarCanvas = container.querySelector('#chart-monthly-bar');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">${titleText}</h1>
        ${mode === 'monthly' ? `
          <div class="ym-picker">
            <select class="form-select" id="select-year">${yearOpts}</select>
            <select class="form-select" id="select-month">${monthOpts}</select>
          </div>
        ` : ''}
      </div>

      <div class="mode-tabs">
        <button class="mode-tab${mode === 'monthly'    ? ' mode-tab--active' : ''}" data-mode="monthly">単月</button>
        <button class="mode-tab${mode === 'yearly'     ? ' mode-tab--active' : ''}" data-mode="yearly">1年</button>
        <button class="mode-tab${mode === 'cumulative' ? ' mode-tab--active' : ''}" data-mode="cumulative">累計</button>
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

      <div class="charts-grid">
        <div class="chart-card">
          <h2 class="chart-title">支出内訳</h2>
          <div class="chart-wrap">
            <canvas id="chart-expense-pie"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <h2 class="chart-title">${barTitle}</h2>
          <div class="chart-wrap">
            <canvas id="chart-monthly-bar"></canvas>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">カテゴリ別支出</h2>
        </div>
        ${renderCategoryBreakdown(displayTxs, summary.expense)}
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">直近の取引</h2>
          <button class="btn btn--text" id="btn-view-all">すべて見る</button>
        </div>
        ${recent.length === 0
          ? '<p class="empty-text">取引はありません</p>'
          : `<ul class="tx-list">${recent.map(renderTxItem).join('')}</ul>`}
      </div>
    </div>
  `;

  // 既存の chart canvas を DOM に戻して Chart インスタンスを再利用可能にする
  if (existingPieCanvas) {
    const ph = container.querySelector('#chart-expense-pie');
    if (ph) ph.replaceWith(existingPieCanvas);
  }
  if (existingBarCanvas) {
    const ph = container.querySelector('#chart-monthly-bar');
    if (ph) ph.replaceWith(existingBarCanvas);
  }

  if (mode === 'monthly') {
    document.getElementById('select-year').addEventListener('change', e => {
      const year = e.target.value;
      const mfy  = monthRange.filter(m => m.startsWith(year));
      const kept = mfy.find(m => m.slice(5) === selMonth);
      setState({ currentYearMonth: kept || mfy[0] });
    });
    document.getElementById('select-month').addEventListener('change', e => {
      setState({ currentYearMonth: `${selYear}-${e.target.value}` });
    });
  }

  container.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => setState({ displayMode: btn.dataset.mode }));
  });

  document.getElementById('btn-view-all').addEventListener('click', () => {
    setState({ currentView: 'list' });
  });

  container.querySelectorAll('.tx-item[data-id]').forEach(el => {
    el.addEventListener('click', () => {
      setState({ currentView: 'form', editingId: el.dataset.id });
    });
  });

  renderExpensePieChart('chart-expense-pie', displayTxs);
  renderMonthlyBarChart('chart-monthly-bar', allTxs, chartYm, barCount);
}

function renderCategoryBreakdown(displayTxs, totalExpense) {
  const { budgets } = getState();
  const byCategory  = calcSummaryByCategory(displayTxs, 'expense');
  const entries     = Object.entries(byCategory)
    .map(([catId, amount]) => ({ cat: getCategoryById(catId), amount }))
    .filter(e => e.cat)
    .sort((a, b) => b.amount - a.amount);

  if (entries.length === 0) {
    return '<p class="empty-text">支出データがありません</p>';
  }

  const overBudget = entries.filter(({ cat, amount }) => budgets[cat.id] > 0 && amount > budgets[cat.id]);
  const alertHtml  = overBudget.length > 0
    ? `<div class="budget-alert">⚠️ ${overBudget.map(e => e.cat.name).join('・')} が予算を超過しています</div>`
    : '';

  return alertHtml + `<ul class="cat-list">${entries.map(({ cat, amount }) => {
    const pct    = totalExpense > 0 ? Math.round(amount / totalExpense * 100) : 0;
    const budget = budgets[cat.id] || 0;
    let budgetHtml = '';
    if (budget > 0) {
      const ratio  = amount / budget;
      const barPct = Math.min(ratio * 100, 100).toFixed(1);
      const cls    = ratio > 1 ? 'over' : ratio >= 0.8 ? 'warn' : 'ok';
      budgetHtml = `
        <div class="budget-bar"><div class="budget-bar-fill budget-bar-fill--${cls}" style="width:${barPct}%"></div></div>
        <span class="budget-label budget-label--${cls}">${formatAmount(amount)} / ${formatAmount(budget)}${ratio > 1 ? ' 超過' : ''}</span>`;
    }
    return `<li class="cat-item">
      <span class="tx-icon">${cat.icon}</span>
      <div class="cat-item-main">
        <div class="cat-item-row">
          <span class="cat-item-name">${cat.name}</span>
          <span class="cat-item-amount">${formatAmount(amount)}</span>
          <span class="cat-item-pct">${pct}%</span>
        </div>
        ${budgetHtml}
      </div>
    </li>`;
  }).join('')}</ul>`;
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
