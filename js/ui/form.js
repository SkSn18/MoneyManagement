function renderForm(container) {
  const state     = getState();
  const editingId = state.editingId;

  const editingTx = editingId
    ? state.transactions.find(t => t.id === editingId) || null
    : null;

  const title       = editingTx ? '取引を編集' : '取引を追加';
  const defaultType = editingTx ? editingTx.type : 'expense';

  const typeButtons = ['income', 'expense', 'asset'].map(type => {
    const isActive = defaultType === type;
    return `<button type="button" class="type-btn type-btn--${type}${isActive ? ' type-btn--active' : ''}" data-type="${type}">${formatType(type)}</button>`;
  }).join('');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <button class="btn btn--ghost" id="btn-back">← 戻る</button>
        <h1 class="page-title">${title}</h1>
      </div>

      <form class="form card" id="tx-form" novalidate>

        <div class="form-group">
          <label class="form-label">種別</label>
          <div class="type-selector" id="type-selector">
            ${typeButtons}
          </div>
          <input type="hidden" id="input-type" name="type" value="${defaultType}">
          <span class="form-error" id="error-type"></span>
        </div>

        <div class="form-group">
          <label class="form-label" for="input-amount">金額（円）</label>
          <input type="number" class="form-input" id="input-amount" name="amount"
            min="1" max="100000000" placeholder="例: 500"
            value="${editingTx ? editingTx.amount : ''}">
          <span class="form-error" id="error-amount"></span>
        </div>

        <div class="form-group">
          <label class="form-label" for="input-category">カテゴリ</label>
          <select class="form-select" id="input-category" name="categoryId">
            <option value="">選択してください</option>
            ${buildCategoryOptions(defaultType, editingTx ? editingTx.categoryId : '')}
          </select>
          <span class="form-error" id="error-category"></span>
        </div>

        <div class="form-group">
          <label class="form-label" for="input-date">日付</label>
          <input type="date" class="form-input" id="input-date" name="date"
            value="${editingTx ? editingTx.date : getTodayString()}">
          <span class="form-error" id="error-date"></span>
        </div>

        <div class="form-group">
          <label class="form-label" for="input-memo">メモ（任意）</label>
          <input type="text" class="form-input" id="input-memo" name="memo"
            maxlength="100" placeholder="例: スーパーでの買い物"
            value="${editingTx ? escapeHtml(editingTx.memo) : ''}">
          <span class="form-error" id="error-memo"></span>
        </div>

        <div class="form-actions">
          ${editingTx ? '<button type="button" class="btn btn--danger" id="btn-delete">削除</button>' : ''}
          <button type="submit" class="btn btn--primary">${editingTx ? '更新する' : '追加する'}</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('btn-back').addEventListener('click', () => {
    setState({ currentView: editingId ? 'list' : 'dashboard', editingId: null });
  });

  // 種別ボタンの切り替え → カテゴリ選択肢を更新する
  document.getElementById('type-selector').addEventListener('click', e => {
    const btn = e.target.closest('.type-btn');
    if (!btn) return;

    const type = btn.dataset.type;
    document.getElementById('input-type').value = type;

    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('type-btn--active'));
    btn.classList.add('type-btn--active');

    document.getElementById('input-category').innerHTML =
      '<option value="">選択してください</option>' +
      buildCategoryOptions(type, '');
  });

  // 削除ボタン（編集モードのみ表示）
  const btnDelete = document.getElementById('btn-delete');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      if (!confirm('この取引を削除しますか？')) return;
      btnDelete.disabled = true;
      const updated = await deleteTransaction(editingId);
      setState({ transactions: updated, currentView: 'list', editingId: null });
    });
  }

  document.getElementById('tx-form').addEventListener('submit', async e => {
    e.preventDefault();

    const input = {
      type:       document.getElementById('input-type').value,
      amount:     Number(document.getElementById('input-amount').value),
      categoryId: document.getElementById('input-category').value,
      date:       document.getElementById('input-date').value,
      memo:       document.getElementById('input-memo').value.trim(),
    };

    const errors = validateTransaction(input);

    // エラー表示とフィールドスタイルをリセット
    ['type', 'amount', 'category', 'date', 'memo'].forEach(field => {
      const el = document.getElementById(`error-${field}`);
      if (el) el.textContent = '';
    });
    ['input-amount', 'input-date', 'input-memo'].forEach(id => {
      document.getElementById(id)?.classList.remove('form-input--error');
    });
    document.getElementById('input-category')?.classList.remove('form-select--error');
    document.getElementById('type-selector')?.classList.remove('form-input--error');

    if (Object.keys(errors).length > 0) {
      if (errors.type) {
        document.getElementById('error-type').textContent = errors.type;
        document.getElementById('type-selector').classList.add('form-input--error');
      }
      if (errors.amount) {
        document.getElementById('error-amount').textContent = errors.amount;
        document.getElementById('input-amount').classList.add('form-input--error');
      }
      if (errors.categoryId) {
        document.getElementById('error-category').textContent = errors.categoryId;
        document.getElementById('input-category').classList.add('form-select--error');
      }
      if (errors.date) {
        document.getElementById('error-date').textContent = errors.date;
        document.getElementById('input-date').classList.add('form-input--error');
      }
      if (errors.memo) {
        document.getElementById('error-memo').textContent = errors.memo;
        document.getElementById('input-memo').classList.add('form-input--error');
      }
      return;
    }

    // 二重送信防止
    const submitBtn = e.target.querySelector('[type="submit"]');
    submitBtn.disabled = true;

    // TD-04: addTransaction / updateTransaction が全件配列を返すので再取得不要
    const updated = editingId
      ? await updateTransaction(editingId, input)
      : await addTransaction(input);

    setState({ transactions: updated, currentView: 'list', editingId: null });
  });
}

function buildCategoryOptions(type, selectedId) {
  return getCategoriesByType(type).map(cat => {
    const selected = cat.id === selectedId ? ' selected' : '';
    return `<option value="${cat.id}"${selected}>${cat.icon} ${cat.name}</option>`;
  }).join('');
}
