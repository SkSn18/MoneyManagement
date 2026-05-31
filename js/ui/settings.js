function renderSettings(container) {
  const { recurring, budgets, customCategories } = getState();
  const expenseCats = getCategoriesByType('expense');

  container.innerHTML = `
    <div class="page">
      <div class="page-header">
        <h1 class="page-title">設定</h1>
      </div>

      <!-- ========== 繰り返し取引 ========== -->
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
              <input class="form-input" type="number" id="rec-amount" min="1" max="100000000" placeholder="80000">
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
              <input class="form-input" type="text" id="rec-memo" maxlength="100" placeholder="任意">
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

      <!-- ========== 月次予算 ========== -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">月次予算</h2>
        </div>
        <p class="settings-hint">支出カテゴリごとの月次予算を設定します。0または空欄は未設定。</p>
        <div class="budget-form">
          ${expenseCats.map(cat => `
            <div class="budget-row">
              <span class="tx-icon">${cat.icon}</span>
              <span class="budget-cat-name">${cat.name}</span>
              <input class="form-input budget-input" type="number"
                data-cat-id="${cat.id}" min="0" max="100000000" placeholder="未設定"
                value="${budgets[cat.id] || ''}">
            </div>
          `).join('')}
        </div>
        <div class="form-actions" style="margin-top:16px;">
          <button class="btn btn--primary" id="btn-budget-save">保存する</button>
        </div>
      </div>

      <!-- ========== カテゴリ管理 ========== -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">カテゴリ管理</h2>
          <button class="btn btn--primary" id="btn-cat-toggle">＋ 追加</button>
        </div>

        <div id="cat-add-form" class="card" style="display:none; margin-bottom:16px;">
          <div class="form">
            <div class="form-group">
              <label class="form-label">種別</label>
              <select class="form-select" id="cat-type">
                <option value="expense">支出</option>
                <option value="income">収入</option>
                <option value="asset">資産</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">カテゴリ名</label>
              <input class="form-input" type="text" id="cat-name" maxlength="20" placeholder="例：ジム">
            </div>
            <div class="form-group">
              <label class="form-label">アイコン（絵文字1文字）</label>
              <input class="form-input" type="text" id="cat-icon" maxlength="4" placeholder="🏋️">
            </div>
            <div class="form-actions">
              <button class="btn btn--ghost" id="btn-cat-cancel">キャンセル</button>
              <button class="btn btn--primary" id="btn-cat-save">追加する</button>
            </div>
          </div>
        </div>

        ${customCategories.length > 0 ? `
          <h3 class="settings-subheading">カスタムカテゴリ</h3>
          <ul class="cat-manage-list">
            ${customCategories.map(cat => `
              <li class="cat-manage-item" data-id="${cat.id}">
                <span class="tx-icon cat-manage-icon" id="icon-${cat.id}">${cat.icon}</span>
                <div class="cat-manage-info">
                  <span class="cat-manage-name">${escapeHtml(cat.name)}</span>
                  <span class="cat-manage-type">${formatType(cat.type)}</span>
                </div>
                <div class="cat-manage-actions">
                  <button class="btn btn--ghost btn-cat-edit" data-id="${cat.id}" title="編集">✏️</button>
                  <button class="btn btn--icon btn-cat-delete" data-id="${cat.id}" title="削除">🗑️</button>
                </div>
              </li>
            `).join('')}
          </ul>
        ` : ''}

        <h3 class="settings-subheading" style="margin-top:${customCategories.length > 0 ? '20px' : '0'};">組み込みカテゴリ</h3>
        <ul class="cat-manage-list cat-manage-list--builtin">
          ${['expense','income','asset'].flatMap(type =>
            getCategoriesByType(type).filter(c => !c.custom).map(cat => `
              <li class="cat-manage-item">
                <span class="tx-icon">${cat.icon}</span>
                <div class="cat-manage-info">
                  <span class="cat-manage-name">${cat.name}</span>
                  <span class="cat-manage-type">${formatType(cat.type)}</span>
                </div>
              </li>
            `)
          ).join('')}
        </ul>
      </div>
    </div>
  `;

  // ---- 繰り返し取引イベント ----
  const recAddForm = document.getElementById('rec-add-form');

  document.getElementById('btn-rec-toggle').addEventListener('click', () => {
    recAddForm.style.display = recAddForm.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('btn-rec-cancel').addEventListener('click', () => {
    recAddForm.style.display = 'none';
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

  // ---- 予算保存イベント ----
  document.getElementById('btn-budget-save').addEventListener('click', async () => {
    const updated = {};
    container.querySelectorAll('.budget-input').forEach(input => {
      const val = Number(input.value);
      if (val > 0) updated[input.dataset.catId] = val;
    });
    await saveBudgets(updated);
    setState({ budgets: updated });
    showBanner('success', '予算を保存しました。');
  });

  // ---- カテゴリ追加イベント ----
  const catAddForm = document.getElementById('cat-add-form');

  document.getElementById('btn-cat-toggle').addEventListener('click', () => {
    catAddForm.style.display = catAddForm.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('btn-cat-cancel').addEventListener('click', () => {
    catAddForm.style.display = 'none';
  });
  document.getElementById('btn-cat-save').addEventListener('click', async () => {
    const type = document.getElementById('cat-type').value;
    const name = document.getElementById('cat-name').value.trim();
    const icon = document.getElementById('cat-icon').value.trim() || '📌';

    if (!name) {
      showBanner('error', 'カテゴリ名を入力してください。');
      return;
    }
    const entry   = { id: crypto.randomUUID(), type, name, icon, custom: true };
    const updated = [...customCategories, entry];
    await saveCustomCategories(updated);
    initCategories(updated);
    setState({ customCategories: updated });
  });

  // ---- カテゴリ編集イベント ----
  container.querySelectorAll('.btn-cat-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = btn.dataset.id;
      const cat  = customCategories.find(c => c.id === id);
      if (!cat) return;
      const li   = container.querySelector(`.cat-manage-item[data-id="${id}"]`);
      if (!li) return;

      li.innerHTML = `
        <input class="form-input" id="edit-icon-${id}" type="text" maxlength="4"
          value="${escapeHtml(cat.icon)}" style="width:52px; text-align:center;">
        <input class="form-input" id="edit-name-${id}" type="text" maxlength="20"
          value="${escapeHtml(cat.name)}" style="flex:1;">
        <div class="cat-manage-actions">
          <button class="btn btn--primary btn-cat-edit-save" data-id="${id}">保存</button>
          <button class="btn btn--ghost btn-cat-edit-cancel" data-id="${id}">取消</button>
        </div>
      `;

      li.querySelector('.btn-cat-edit-cancel').addEventListener('click', () => {
        setState({ customCategories });
      });
      li.querySelector('.btn-cat-edit-save').addEventListener('click', async () => {
        const newIcon = document.getElementById(`edit-icon-${id}`).value.trim() || '📌';
        const newName = document.getElementById(`edit-name-${id}`).value.trim();
        if (!newName) { showBanner('error', 'カテゴリ名を入力してください。'); return; }
        const updated = customCategories.map(c => c.id === id ? { ...c, name: newName, icon: newIcon } : c);
        await saveCustomCategories(updated);
        initCategories(updated);
        setState({ customCategories: updated });
      });
    });
  });

  // ---- カテゴリ削除イベント ----
  container.querySelectorAll('.btn-cat-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const { transactions } = getState();
      const id = btn.dataset.id;
      const inUse = transactions.some(t => t.categoryId === id);
      if (inUse) {
        showBanner('error', 'このカテゴリは取引で使用中のため削除できません。');
        return;
      }
      if (!await showConfirmModal('このカテゴリを削除しますか？')) return;
      const updated = customCategories.filter(c => c.id !== id);
      await saveCustomCategories(updated);
      initCategories(updated);
      setState({ customCategories: updated });
    });
  });
}
