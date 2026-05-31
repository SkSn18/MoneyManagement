function renderList(container) {
  const state   = getState();
  const ym      = state.currentYearMonth;
  const keyword = state.filterKeyword.trim().toLowerCase();

  const filtered = state.transactions
    .filter(t => t.date.startsWith(ym))
    .filter(t => state.filterType === 'all' || t.type === state.filterType)
    .filter(t => {
      if (!keyword) return true;
      const cat = getCategoryById(t.categoryId);
      return (
        (t.memo && t.memo.toLowerCase().includes(keyword)) ||
        String(t.amount).startsWith(keyword) ||
        (cat && cat.name.toLowerCase().includes(keyword))
      );
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const filterTypes = ['all', 'income', 'expense', 'asset'];

  // 月プルダウン選択肢（新しい順）
  const monthRange = getMonthRange(state.transactions).slice().reverse();
  const ymOptions  = monthRange.map(m =>
    `<option value="${m}"${m === ym ? ' selected' : ''}>${formatYearMonth(m)}</option>`
  ).join('');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">取引一覧</h1>
        <select class="form-select select-ym" id="select-ym">${ymOptions}</select>
        <button class="btn btn--ghost" id="btn-export">CSV出力</button>
      </div>

      <div class="filter-bar">
        ${filterTypes.map(type => {
          const isActive = state.filterType === type;
          const label    = type === 'all' ? 'すべて' : formatType(type);
          return `<button class="filter-btn${isActive ? ' filter-btn--active' : ''}" data-type="${type}">${label}</button>`;
        }).join('')}
      </div>

      <div class="search-bar">
        <input class="form-input" type="search" id="input-search"
          placeholder="メモ・カテゴリ・金額で絞り込み"
          value="${escapeHtml(state.filterKeyword)}">
      </div>

      ${filtered.length === 0
        ? `<p class="empty-text">${keyword ? '該当する取引はありません' : '取引はありません'}</p>`
        : `<ul class="tx-list">${filtered.map(renderTxItemWithActions).join('')}</ul>`}
    </div>
  `;

  document.getElementById('select-ym').addEventListener('change', e => {
    setState({ currentYearMonth: e.target.value, filterType: 'all', filterKeyword: '' });
  });

  // CSVエクスポート（表示中のデータをダウンロード）
  document.getElementById('btn-export').addEventListener('click', () => {
    const csv      = transactionsToCsv(filtered);
    const label    = formatYearMonth(ym).replace('年', '-').replace('月', '');
    const filename = `家計簿_${label}.csv`;
    downloadCsv(csv, filename);
  });

  document.getElementById('input-search').addEventListener('input', e => {
    setState({ filterKeyword: e.target.value });
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
      if (!await showConfirmModal('この取引を削除しますか？')) return;
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
