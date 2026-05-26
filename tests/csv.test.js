// csv.js は getCategoryById と formatType に依存するためグローバルに定義する
global.getCategoryById = (id) => {
  const map = { food: { name: '食費' }, salary: { name: '給料' } };
  return map[id] || null;
};
global.formatType = (type) => {
  const map = { income: '収入', expense: '支出', asset: '資産' };
  return map[type] || type;
};

const { escapeCsvField, transactionsToCsv } = require('../js/utils/csv');

describe('escapeCsvField', () => {
  test('通常の文字列はそのまま', () => expect(escapeCsvField('hello')).toBe('hello'));
  test('数値は文字列化される', () => expect(escapeCsvField(1234)).toBe('1234'));
  test('null / undefined は空文字', () => {
    expect(escapeCsvField(null)).toBe('');
    expect(escapeCsvField(undefined)).toBe('');
  });
  test('カンマを含む場合はダブルクォートで囲む', () => {
    expect(escapeCsvField('a,b')).toBe('"a,b"');
  });
  test('ダブルクォートは二重化してから囲む', () => {
    expect(escapeCsvField('a"b')).toBe('"a""b"');
  });
  test('改行を含む場合はダブルクォートで囲む', () => {
    expect(escapeCsvField('a\nb')).toBe('"a\nb"');
  });
});

describe('transactionsToCsv', () => {
  const txs = [
    { type: 'expense', amount: 500,   categoryId: 'food',   date: '2026-05-01', memo: '昼食' },
    { type: 'income',  amount: 200000, categoryId: 'salary', date: '2026-05-25', memo: '' },
  ];

  test('ヘッダー行が先頭に含まれる', () => {
    const csv = transactionsToCsv(txs);
    expect(csv.startsWith('日付,種別,カテゴリ,金額,メモ')).toBe(true);
  });

  test('データ行が正しく生成される', () => {
    const lines = transactionsToCsv(txs).split('\r\n');
    expect(lines[1]).toBe('2026-05-01,支出,食費,500,昼食');
    expect(lines[2]).toBe('2026-05-25,収入,給料,200000,');
  });

  test('空配列はヘッダー行のみ', () => {
    const csv = transactionsToCsv([]);
    expect(csv).toBe('日付,種別,カテゴリ,金額,メモ');
  });

  test('カテゴリが見つからない場合は categoryId をそのまま使う', () => {
    const txs2 = [{ type: 'expense', amount: 100, categoryId: 'unknown_id', date: '2026-05-01', memo: '' }];
    const csv  = transactionsToCsv(txs2);
    expect(csv).toContain('unknown_id');
  });

  test('メモにカンマが含まれる場合はダブルクォートで囲む', () => {
    const txs2 = [{ type: 'expense', amount: 100, categoryId: 'food', date: '2026-05-01', memo: 'A,B' }];
    const csv  = transactionsToCsv(txs2);
    expect(csv).toContain('"A,B"');
  });
});
