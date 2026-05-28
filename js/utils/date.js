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

// 全取引データの最古年月から max(現在月, 最新取引月) までの配列を返す（プルダウン選択肢の生成に使用）
function getMonthRange(allTransactions) {
  const current = getCurrentYearMonth();
  if (!allTransactions || allTransactions.length === 0) return [current];

  const months = allTransactions.map(t => t.date.slice(0, 7));
  const oldest = months.reduce((a, b) => (a < b ? a : b));
  const newest = months.reduce((a, b) => (a > b ? a : b));
  const end    = newest > current ? newest : current;

  const result = [];
  let ym = oldest;
  while (ym <= end) {
    result.push(ym);
    ym = getNextMonth(ym);
  }
  return result;
}

if (typeof module !== 'undefined') {
  module.exports = { getCurrentYearMonth, formatYearMonth, formatDate, getNextMonth, getPrevMonth, getTodayString, getMonthRange };
}
