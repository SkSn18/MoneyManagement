function showBanner(type, message) {
  const el = document.getElementById('app-banner');
  if (!el) return;
  el.textContent = message;
  el.className = `app-banner app-banner--${type}`;
  el.style.display = 'block';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function showConfirmModal(message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <p class="modal-message">${message}</p>
        <div class="modal-actions">
          <button class="btn btn--ghost" id="modal-cancel">キャンセル</button>
          <button class="btn btn--danger" id="modal-confirm">削除する</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const close = result => { overlay.remove(); resolve(result); };

    overlay.querySelector('#modal-cancel').addEventListener('click', () => close(false));
    overlay.querySelector('#modal-confirm').addEventListener('click', () => close(true));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
  });
}
