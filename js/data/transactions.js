// 取引の CRUD 操作（storage.js を使う）
// 各関数は操作後の全取引配列を返す（呼び出し側で再取得不要）

async function getAllTransactions() {
  return loadTransactions();
}

async function addTransaction(data) {
  const all = await loadTransactions();
  const now = new Date().toISOString();
  const newTx = {
    id:         crypto.randomUUID(),
    type:       data.type,
    amount:     Number(data.amount),
    categoryId: data.categoryId,
    date:       data.date,
    memo:       data.memo || '',
    createdAt:  now,
    updatedAt:  now,
  };
  all.push(newTx);
  await saveTransactions(all);
  return all;
}

// 見つからなければ null を返す
async function updateTransaction(id, changes) {
  const all   = await loadTransactions();
  const index = all.findIndex(t => t.id === id);
  if (index === -1) return null;

  all[index] = Object.assign({}, all[index], {
    type:       changes.type       != null ? changes.type       : all[index].type,
    amount:     Number(changes.amount != null ? changes.amount : all[index].amount),
    categoryId: changes.categoryId != null ? changes.categoryId : all[index].categoryId,
    date:       changes.date       != null ? changes.date       : all[index].date,
    memo:       changes.memo       != null ? changes.memo       : all[index].memo,
    updatedAt:  new Date().toISOString(),
  });
  await saveTransactions(all);
  return all;
}

async function addTransactions(dataArray) {
  const all = await loadTransactions();
  const now = new Date().toISOString();
  dataArray.forEach(data => {
    all.push({
      id:         crypto.randomUUID(),
      type:       data.type,
      amount:     Number(data.amount),
      categoryId: data.categoryId,
      date:       data.date,
      memo:       data.memo || '',
      createdAt:  now,
      updatedAt:  now,
    });
  });
  await saveTransactions(all);
  return all;
}

async function deleteTransaction(id) {
  const all      = await loadTransactions();
  const filtered = all.filter(t => t.id !== id);
  await saveTransactions(filtered);
  return filtered;
}

async function replaceAllTransactions(transactions) {
  await saveTransactions(transactions);
  return transactions;
}

function calcSummary(transactions) {
  let income  = 0;
  let expense = 0;
  let asset   = 0;

  transactions.forEach(t => {
    if (t.type === 'income')  income  += t.amount;
    if (t.type === 'expense') expense += t.amount;
    if (t.type === 'asset')   asset   += t.amount;
  });

  return { income, expense, asset, balance: income - expense - asset };
}

function calcSummaryByCategory(transactions, type) {
  const result = {};
  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      result[t.categoryId] = (result[t.categoryId] || 0) + t.amount;
    });
  return result;
}

function calcMonthlySummary(allTransactions, baseYearMonth, count) {
  const months = [];
  let ym = baseYearMonth;
  for (let i = 0; i < count; i++) {
    months.unshift(ym);
    ym = getPrevMonth(ym);
  }
  return months.map(m => {
    const txs = allTransactions.filter(t => t.date.startsWith(m));
    const s = calcSummary(txs);
    return { ym: m, income: s.income, expense: s.expense };
  });
}

if (typeof module !== 'undefined') {
  module.exports = { calcSummary, calcSummaryByCategory, calcMonthlySummary, addTransactions, replaceAllTransactions };
}
