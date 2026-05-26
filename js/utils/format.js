function formatAmount(amount) {
  return `¥${Number(amount).toLocaleString('ja-JP')}`;
}

const TYPE_LABELS = {
  income:  '収入',
  expense: '支出',
  asset:   '資産',
};

function formatType(type) {
  return TYPE_LABELS[type] || type;
}

// XSS対策: innerHTML に埋め込む文字列にのみ使う（textContent への代入は不要）
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

if (typeof module !== 'undefined') {
  module.exports = { formatAmount, formatType, escapeHtml };
}
