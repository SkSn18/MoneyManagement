function renderList(container) {
  const state = getState();
  const ym    = state.currentYearMonth;

  const filtered = state.transactions
    .filter(t => t.date.startsWith(ym))
    .filter(t => state.filterType === 'all' || t.type === state.filterType)
    .sort((a, b) => b.date.localeCompare(a.date));

  const filterTypes = ['all', 'income', 'expense', 'asset'];

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">${formatYearMonth(ym)}</h1>
        <div class="month-nav">
          <button class="btn btn--ghost" id="btn-prev-month">＜</button>
          <button class="btn btn--ghost" id="btn-next-month">＞</button>
        </div>
        <button class="btn btn--ghost" id="btn-export" title="CSVダウンロード">CSV</button>
      </div>

      <div class="filter-bar">
        ${filterTypes.map(type => {
          const isActive = state.filterType === type;
          const label    = type === 'all' ? 'すべて' : formatType(type);
          return `<button class="filter-btn${isActive ? ' filter-btn--active' : ''}" data-type="${type}">${label}</button>`;
        }).join('')}
      </div>

      ${filtered.length === 0
        ? '<p class="empty-text">取引はありません</p>'
        : `<ul class="tx-list">${filtered.map(renderTxItemWithActions).join('')}</ul>`}
    </div>
  `;

  // CSVエクスポート（表示中のデータをダウンロード）
  document.getElementById('btn-export').addEventListener('click', () => {
    const csv      = transactionsToCsv(filtered);
    const label    = formatYearMonth(ym).replace('年', '-').replace('月', '');
    const filename = `家計簿_${label}.csv`;
    downloadCsv(csv, filename);
  });

  // 月ナビゲーション（TD-08: 月を変えたらフィルタをリセット）
  document.getElementById('btn-prev-month').addEventListener('click', () => {
    setState({ currentYearMonth: getPrevMonth(ym), filterType: 'all' });
  });
  document.getElementById('btn-next-month').addEventListener('click', () => {
    setState({ currentYearMonth: getNextMonth(ym), filterType: 'all' });
  });

  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => setState({ filterType: btn.dataset.type }));
  });

  container.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      setState({ currentView: 'form', editingId: btn.dataset.id });
    });
  });

  container.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('この取引を削除しますか？')) return;
      btn.disabled = true;
      const updated = await deleteTransaction(btn.dataset.id);
      setState({ transactions: updated });
    });
  });
}

function renderTxItemWithActions(tx) {
  const cat  = getCategoryById(tx.categoryId);
  const memo = tx.memo ? ` · ${escapeHtml(tx.memo)}` : '';
  return `
    <li class="tx-item tx-item--${tx.type}">
      <span class="tx-icon">${cat ? cat.icon : '📌'}</span>
      <div class="tx-info">
        <span class="tx-name">${cat ? cat.name : escapeHtml(tx.categoryId)}</span>
        <span class="tx-date">${formatDate(tx.date)}${memo}</span>
      </div>
      <span class="tx-amount tx-amount--${tx.type}">${formatAmount(tx.amount)}</span>
      <div class="tx-actions">
        <button class="btn btn--icon btn-edit"   data-id="${tx.id}" title="編集">✏️</button>
        <button class="btn btn--icon btn-delete" data-id="${tx.id}" title="削除">🗑️</button>
      </div>
    </li>
  `;
}
