function getCurrentYearMonth() {
  const now   = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

function formatYearMonth(ym) {
  const parts = ym.split('-');
  return `${parts[0]}年${parseInt(parts[1])}月`;
}

function formatDate(dateStr) {
  const parts = dateStr.split('-');
  return `${parseInt(parts[1])}月${parseInt(parts[2])}日`;
}

function getNextMonth(ym) {
  const parts = ym.split('-').map(Number);
  // new Date(年, 月, 1): month は0始まりなので parts[1] はそのまま使う
  const d = new Date(parts[0], parts[1], 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getPrevMonth(ym) {
  const parts = ym.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getTodayString() {
  const now   = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

if (typeof module !== 'undefined') {
  module.exports = { getCurrentYearMonth, formatYearMonth, formatDate, getNextMonth, getPrevMonth, getTodayString };
}
