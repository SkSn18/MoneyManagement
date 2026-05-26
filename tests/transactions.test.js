const { calcSummary } = require('../js/data/transactions');

describe('calcSummary', () => {
  test('空配列はすべて0', () => {
    expect(calcSummary([])).toEqual({ income: 0, expense: 0, asset: 0, balance: 0 });
  });

  test('収入のみ', () => {
    const txs = [
      { type: 'income', amount: 3000 },
      { type: 'income', amount: 2000 },
    ];
    expect(calcSummary(txs)).toEqual({ income: 5000, expense: 0, asset: 0, balance: 5000 });
  });

  test('支出のみ', () => {
    const txs = [{ type: 'expense', amount: 1500 }];
    expect(calcSummary(txs)).toEqual({ income: 0, expense: 1500, asset: 0, balance: -1500 });
  });

  test('収入・支出・資産の混在', () => {
    const txs = [
      { type: 'income',  amount: 200000 },
      { type: 'expense', amount: 50000 },
      { type: 'asset',   amount: 30000 },
    ];
    // balance = 200000 - 50000 - 30000 = 120000
    expect(calcSummary(txs)).toEqual({ income: 200000, expense: 50000, asset: 30000, balance: 120000 });
  });

  test('差引残高がマイナスになるケース', () => {
    const txs = [
      { type: 'income',  amount: 1000 },
      { type: 'expense', amount: 5000 },
    ];
    expect(calcSummary(txs).balance).toBe(-4000);
  });
});
