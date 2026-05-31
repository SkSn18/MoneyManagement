// 入力行の状態をモジュール変数で管理（appState には載せない）
let _rows        = [];
let _editingId   = null;
let _showSuccess = false;
let _successCount = 0;

function createEmptyRow() {
  return {
    _id:        Math.random().toString(36).slice(2, 10),
    date:       getTodayString(),
    type:       'expense',
    categoryId: '',
    amount:     '',
    memo:       '',
    errors:     {},
  };
}

function txToRow(tx) {
  return {
    _id:        Math.random().toString(36).slice(2, 10),
    date:       tx.date,
    type:       tx.type,
    categoryId: tx.categoryId,
    amount:     String(tx.amount),
    memo:       tx.memo || '',
    errors:     {},
  };
}

function syncRowsFromDom() {
  const tbody = document.getElementById('form-table-body');
  if (!tbody) return;
  tbody.querySelectorAll('tr[data-row-id]').forEach(tr => {
    const row = _rows.find(r => r._id === tr.dataset.rowId);
    if (!row) return;
    tr.querySelectorAll('[data-field]').forEach(el => {
      row[el.dataset.field] = el.value;
    });
  });
}

function rerenderTableBody() {
  const tbody = document.getElementById('form-table-body');
  if (tbody) tbody.innerHTML = _rows.map(renderFormRow).join('');
}

function renderFormRow(row) {
  const typeOptions = ['income', 'expense', 'asset'].map(t =>
    `<option value="${t}"${t === row.type ? ' selected' : ''}>${formatType(t)}</option>`
  ).join('');

  const dateClass   = row.errors.date       ? 'form-input form-input--error' : 'form-input';
  const catClass    = row.errors.categoryId ? 'form-select form-select--error' : 'form-select';
  const amountClass = row.errors.amount     ? 'form-input form-input--error' : 'form-input';

  return `
    <tr data-row-id="${row._id}">
      <td data-label="日付">
        <input type="date" class="${dateClass} row-input" data-field="date"
          value="${escapeHtml(row.date)}">
        ${row.errors.date ? `<span class="form-error">${row.errors.date}</span>` : ''}
      </td>
      <td data-label="種別">
        <select class="form-select row-input" data-field="type">
          ${typeOptions}
        </select>
      </td>
      <td data-label="カテゴリ">
        <select class="${catClass} row-input" data-field="categoryId">
          <option value="">選択</option>
          ${buildCategoryOptions(row.type, row.categoryId)}
        </select>
        ${row.errors.categoryId ? `<span class="form-error">${row.errors.categoryId}</span>` : ''}
      </td>
      <td data-label="金額（円）">
        <input type="number" class="${amountClass} row-input" data-field="amount"
          min="1" max="100000000" placeholder="500"
          value="${escapeHtml(row.amount)}">
        ${row.errors.amount ? `<span class="form-error">${row.errors.amount}</span>` : ''}
      </td>
      <td data-label="メモ">
        <input type="text" class="form-input row-input" data-field="memo"
          maxlength="100" placeholder="任意"
          value="${escapeHtml(row.memo || '')}">
        ${row.errors.memo ? `<span class="form-error">${row.errors.memo}</span>` : ''}
      </td>
      <td class="form-table-delete-cell">
        <button type="button" class="btn btn--icon btn-row-delete"
          data-row-id="${row._id}" title="削除">🗑</button>
      </td>
    </tr>
  `;
}

function renderForm(container) {
  const state          = getState();
  const incomingEditId = state.editingId;

  if (incomingEditId) {
    const tx = state.transactions.find(t => t.id === incomingEditId);
    _rows      = tx ? [txToRow(tx)] : [createEmptyRow()];
    _editingId = incomingEditId;
  } else {
    if (_editingId !== null) {
      _rows = [createEmptyRow()];
    } else if (_rows.length === 0) {
      _rows = [createEmptyRow()];
    }
    _editingId = null;
  }

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <button class="btn btn--ghost" id="btn-back">← 戻る</button>
        <h1 class="page-title">${_editingId ? '取引を編集' : '取引を追加'}</h1>
      </div>

      ${!_editingId ? `
      <div class="form-actions-top">
        <input type="file" id="input-csv-import" accept=".csv" style="display:none">
        <button class="btn btn--ghost" id="btn-import">CSV取込</button>
        <button class="btn btn--ghost" id="btn-template">CSVレイアウト出力</button>
      </div>
      ` : ''}

      <div id="success-banner" class="success-banner" style="display:none"></div>

      <div class="card">
        <div class="form-table-wrap">
          <table class="form-table">
            <thead>
              <tr>
                <th>日付</th>
                <th>種別</th>
                <th>カテゴリ</th>
                <th>金額（円）</th>
                <th>メモ</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="form-table-body">
              ${_rows.map(renderFormRow).join('')}
            </tbody>
          </table>
        </div>

        ${!_editingId ? `
        <div class="form-table-add">
          <button type="button" class="btn btn--ghost" id="btn-add-row">＋ 行を追加</button>
        </div>
        ` : ''}

        <div class="form-actions">
          ${_editingId ? '<button type="button" class="btn btn--danger" id="btn-delete">削除</button>' : ''}
          <button type="button" class="btn btn--primary" id="btn-save">
            ${_editingId ? '更新する' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  `;

  // 保存完了バナー
  if (_showSuccess) {
    const banner       = document.getElementById('success-banner');
    banner.textContent = `${_successCount}件を登録しました`;
    banner.style.display = 'block';
    _showSuccess = false;
    setTimeout(() => { if (banner) banner.style.display = 'none'; }, 2000);
  }

  // 戻るボタン
  document.getElementById('btn-back').addEventListener('click', () => {
    setState({ currentView: _editingId ? 'list' : 'dashboard', editingId: null });
  });

  // 削除ボタン（編集モードのみ）
  const btnDelete = document.getElementById('btn-delete');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      if (!await showConfirmModal('この取引を削除しますか？')) return;
      btnDelete.disabled = true;
      const updated = await deleteTransaction(_editingId);
      setState({ transactions: updated, currentView: 'list', editingId: null });
      _rows = [];
    });
  }

  // CSV ボタン（追加モードのみ）
  if (!_editingId) {
    document.getElementById('btn-template').addEventListener('click', () => {
      downloadCsvTemplate();
    });

    document.getElementById('btn-import').addEventListener('click', () => {
      document.getElementById('input-csv-import').click();
    });

    document.getElementById('input-csv-import').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;

      const text             = await file.text();
      const rows             = parseCsv(text);
      const { valid, errors } = csvToTransactions(rows);

      if (valid.length === 0) {
        const detail = errors.length > 0
          ? ` (${errors.slice(0, 3).join(' / ')})`
          : '';
        showBanner('error', `取り込める行がありませんでした。${detail}`);
        e.target.value = '';
        return;
      }

      syncRowsFromDom();
      const hasContent = r => r.amount !== '' || r.memo !== '' || r.categoryId !== '';
      const existing   = _rows.filter(hasContent);
      const imported   = valid.map(tx => ({
        _id:        Math.random().toString(36).slice(2, 10),
        date:       tx.date,
        type:       tx.type,
        categoryId: tx.categoryId,
        amount:     String(tx.amount),
        memo:       tx.memo || '',
        errors:     {},
      }));

      _rows = [...existing, ...imported];
      if (_rows.length === 0) _rows = [createEmptyRow()];
      rerenderTableBody();
      e.target.value = '';

      if (errors.length > 0) {
        showBanner('error', `${valid.length}行を取り込みました。エラーのため${errors.length}行をスキップしました。`);
      }
    });

    document.getElementById('btn-add-row').addEventListener('click', () => {
      syncRowsFromDom();
      _rows.push(createEmptyRow());
      rerenderTableBody();
    });
  }

  // テーブルのイベント委譲
  const tbody = document.getElementById('form-table-body');

  tbody.addEventListener('change', e => {
    const tr = e.target.closest('tr[data-row-id]');
    if (!tr) return;
    const row = _rows.find(r => r._id === tr.dataset.rowId);
    if (!row || !e.target.dataset.field) return;

    row[e.target.dataset.field] = e.target.value;

    // 種別変更 → カテゴリ選択肢を当該行だけ更新
    if (e.target.dataset.field === 'type') {
      const catSelect = tr.querySelector('[data-field="categoryId"]');
      if (catSelect) {
        catSelect.innerHTML = '<option value="">選択</option>' + buildCategoryOptions(row.type, '');
        catSelect.value = '';
        row.categoryId = '';
      }
    }
  });

  tbody.addEventListener('input', e => {
    const tr = e.target.closest('tr[data-row-id]');
    if (!tr) return;
    const row = _rows.find(r => r._id === tr.dataset.rowId);
    if (row && e.target.dataset.field) row[e.target.dataset.field] = e.target.value;
  });

  tbody.addEventListener('click', e => {
    const btn = e.target.closest('.btn-row-delete');
    if (!btn) return;
    syncRowsFromDom();
    _rows = _rows.filter(r => r._id !== btn.dataset.rowId);
    if (_rows.length === 0) _rows = [createEmptyRow()];
    rerenderTableBody();
  });

  // 保存ボタン
  document.getElementById('btn-save').addEventListener('click', async () => {
    syncRowsFromDom();

    let hasErrors = false;
    _rows.forEach(row => {
      row.errors = validateTransaction({
        type:       row.type,
        amount:     Number(row.amount),
        categoryId: row.categoryId,
        date:       row.date,
        memo:       row.memo || '',
      });
      if (Object.keys(row.errors).length > 0) hasErrors = true;
    });

    if (hasErrors) {
      rerenderTableBody();
      const firstError = document.querySelector('.form-input--error, .form-select--error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const btnSave = document.getElementById('btn-save');
    btnSave.disabled = true;

    if (_editingId) {
      const row     = _rows[0];
      const updated = await updateTransaction(_editingId, {
        type:       row.type,
        amount:     Number(row.amount),
        categoryId: row.categoryId,
        date:       row.date,
        memo:       row.memo || '',
      });
      _rows = [];
      setState({ transactions: updated, currentView: 'list', editingId: null });
    } else {
      const count   = _rows.length;
      const toAdd   = _rows.map(row => ({
        type:       row.type,
        amount:     Number(row.amount),
        categoryId: row.categoryId,
        date:       row.date,
        memo:       row.memo || '',
      }));
      const updated = await addTransactions(toAdd);
      _rows         = [createEmptyRow()];
      _showSuccess  = true;
      _successCount = count;
      setState({ transactions: updated });
    }
  });
}

function buildCategoryOptions(type, selectedId) {
  return getCategoriesByType(type).map(cat => {
    const selected = cat.id === selectedId ? ' selected' : '';
    return `<option value="${cat.id}"${selected}>${cat.icon} ${cat.name}</option>`;
  }).join('');
}
