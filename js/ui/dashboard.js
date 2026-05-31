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

  // 月プルダウン選択肢（単月モードのみ表示、新しい順）
  const monthRange = getMonthRange(allTxs).slice().reverse();
  const ymOptions  = monthRange.map(m =>
    `<option value="${m}"${m === ym ? ' selected' : ''}>${formatYearMonth(m)}</option>`
  ).join('');

  const barTitle = mode === 'cumulative' ? '月次収支（全期間）' : '月次収支（直近12ヶ月）';

  // chart canvas を保持して DOM の連続性を維持（Chart.update() による再描画のため）
  const existingPieCanvas = container.querySelector('#chart-expense-pie');
  const existingBarCanvas = container.querySelector('#chart-monthly-bar');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">${titleText}</h1>
        <select class="form-select select-ym${mode !== 'monthly' ? ' select-ym--hidden' : ''}"
          id="select-ym">${ymOptions}</select>
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
    document.getElementById('select-ym').addEventListener('change', e => {
      setState({ currentYearMonth: e.target.value });
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
  const byCategory = calcSummaryByCategory(displayTxs, 'expense');
  const entries = Object.entries(byCategory)
    .map(([catId, amount]) => ({ cat: getCategoryById(catId), amount }))
    .filter(e => e.cat)
    .sort((a, b) => b.amount - a.amount);

  if (entries.length === 0) {
    return '<p class="empty-text">支出データがありません</p>';
  }

  return `<ul class="cat-list">${entries.map(({ cat, amount }) => {
    const pct = totalExpense > 0 ? Math.round(amount / totalExpense * 100) : 0;
    return `<li class="cat-item">
      <span class="tx-icon">${cat.icon}</span>
      <span class="cat-item-name">${cat.name}</span>
      <span class="cat-item-amount">${formatAmount(amount)}</span>
      <span class="cat-item-pct">${pct}%</span>
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
