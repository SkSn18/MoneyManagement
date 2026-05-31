function renderSettings(container) {
  const state     = getState();
  const recurring = state.recurring;

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">設定</h1>
      </div>

      <div class="section">
        <div class="section-header">
          <h2 class="section-title">繰り返し取引</h2>
          <button class="btn btn--primary" id="btn-rec-toggle">＋ 追加</button>
        </div>

        <div id="rec-add-form" class="card" style="display:none; margin-bottom:16px;">
          <div class="form">
            <div class="form-group">
              <label class="form-label">種別</label>
              <select class="form-select" id="rec-type">
                <option value="expense">支出</option>
                <option value="income">収入</option>
                <option value="asset">資産</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">カテゴリ</label>
              <select class="form-select" id="rec-cat">
                <option value="">選択</option>
                ${getCategoriesByType('expense').map(c =>
                  `<option value="${c.id}">${c.icon} ${c.name}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">金額（円）</label>
              <input class="form-input" type="number" id="rec-amount"
                min="1" max="100000000" placeholder="80000">
            </div>
            <div class="form-group">
              <label class="form-label">毎月何日（1〜28日）</label>
              <select class="form-select" id="rec-day">
                ${Array.from({ length: 28 }, (_, i) =>
                  `<option value="${i + 1}">${i + 1}日</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">メモ（任意）</label>
              <input class="form-input" type="text" id="rec-memo"
                maxlength="100" placeholder="任意">
            </div>
            <div class="form-actions">
              <button class="btn btn--ghost" id="btn-rec-cancel">キャンセル</button>
              <button class="btn btn--primary" id="btn-rec-save">追加する</button>
            </div>
          </div>
        </div>

        ${recurring.length === 0
          ? '<p class="empty-text">繰り返し取引はありません</p>'
          : `<ul class="recurring-list">
              ${recurring.map(r => {
                const cat = getCategoryById(r.categoryId);
                const sub = `${formatType(r.type)} · 毎月${r.dayOfMonth}日${r.memo ? ' · ' + escapeHtml(r.memo) : ''}`;
                return `
                  <li class="recurring-item">
                    <span class="tx-icon">${cat ? cat.icon : '📌'}</span>
                    <div class="recurring-info">
                      <span class="recurring-name">${cat ? cat.name : escapeHtml(r.categoryId)}</span>
                      <span class="recurring-sub">${sub}</span>
                    </div>
                    <span class="recurring-amount">${formatAmount(r.amount)}</span>
                    <button class="btn btn--icon btn-rec-delete" data-id="${r.id}" title="削除">🗑️</button>
                  </li>`;
              }).join('')}
            </ul>`}
      </div>
    </div>
  `;

  const addForm = document.getElementById('rec-add-form');

  document.getElementById('btn-rec-toggle').addEventListener('click', () => {
    addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('btn-rec-cancel').addEventListener('click', () => {
    addForm.style.display = 'none';
  });

  document.getElementById('rec-type').addEventListener('change', e => {
    const catSel = document.getElementById('rec-cat');
    catSel.innerHTML = '<option value="">選択</option>' +
      getCategoriesByType(e.target.value).map(c =>
        `<option value="${c.id}">${c.icon} ${c.name}</option>`
      ).join('');
  });

  document.getElementById('btn-rec-save').addEventListener('click', async () => {
    const type       = document.getElementById('rec-type').value;
    const categoryId = document.getElementById('rec-cat').value;
    const amount     = Number(document.getElementById('rec-amount').value);
    const dayOfMonth = Number(document.getElementById('rec-day').value);
    const memo       = document.getElementById('rec-memo').value.trim();

    if (!categoryId || !Number.isInteger(amount) || amount < 1 || amount > 100000000) {
      showBanner('error', 'カテゴリと金額を正しく入力してください。');
      return;
    }

    const entry   = { id: crypto.randomUUID(), type, categoryId, amount, dayOfMonth, memo };
    const updated = [...recurring, entry];
    await saveRecurring(updated);
    setState({ recurring: updated });
  });

  container.querySelectorAll('.btn-rec-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!await showConfirmModal('この繰り返し取引を削除しますか？')) return;
      const updated = recurring.filter(r => r.id !== btn.dataset.id);
      await saveRecurring(updated);
      setState({ recurring: updated });
    });
  });
}
