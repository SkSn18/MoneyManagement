const { validateTransaction } = require('../js/utils/validate');

const VALID = {
  type:       'expense',
  amount:     500,
  categoryId: 'food',
  date:       '2026-05-01',
  memo:       '',
};

describe('validateTransaction — 正常系', () => {
  test('全フィールド正常', () => {
    expect(validateTransaction(VALID)).toEqual({});
  });
  test('メモなしでも有効', () => {
    expect(validateTransaction({ ...VALID, memo: undefined })).toEqual({});
  });
  test('メモ100文字は有効', () => {
    expect(validateTransaction({ ...VALID, memo: 'あ'.repeat(100) })).toEqual({});
  });
  test('income / asset も有効', () => {
    expect(validateTransaction({ ...VALID, type: 'income',  categoryId: 'salary' })).toEqual({});
    expect(validateTransaction({ ...VALID, type: 'asset',   categoryId: 'savings' })).toEqual({});
  });
  test('金額の上限（1億円）は有効', () => {
    expect(validateTransaction({ ...VALID, amount: 100000000 })).toEqual({});
  });
});

describe('validateTransaction — 種別エラー', () => {
  test('空文字はエラー', () => {
    expect(validateTransaction({ ...VALID, type: '' })).toHaveProperty('type');
  });
  test('不正な値はエラー', () => {
    expect(validateTransaction({ ...VALID, type: 'other' })).toHaveProperty('type');
  });
});

describe('validateTransaction — 金額エラー', () => {
  test('0はエラー', () => {
    expect(validateTransaction({ ...VALID, amount: 0 })).toHaveProperty('amount');
  });
  test('負の値はエラー', () => {
    expect(validateTransaction({ ...VALID, amount: -1 })).toHaveProperty('amount');
  });
  test('小数はエラー', () => {
    expect(validateTransaction({ ...VALID, amount: 1.5 })).toHaveProperty('amount');
  });
  test('1億円超はエラー', () => {
    expect(validateTransaction({ ...VALID, amount: 100000001 })).toHaveProperty('amount');
  });
  test('空はエラー', () => {
    expect(validateTransaction({ ...VALID, amount: '' })).toHaveProperty('amount');
  });
});

describe('validateTransaction — カテゴリエラー', () => {
  test('空文字はエラー', () => {
    expect(validateTransaction({ ...VALID, categoryId: '' })).toHaveProperty('categoryId');
  });
});

describe('validateTransaction — 日付エラー', () => {
  test('空はエラー', () => {
    expect(validateTransaction({ ...VALID, date: '' })).toHaveProperty('date');
  });
  test('不正な日付はエラー', () => {
    expect(validateTransaction({ ...VALID, date: 'not-a-date' })).toHaveProperty('date');
  });
});

describe('validateTransaction — メモエラー', () => {
  test('101文字はエラー', () => {
    expect(validateTransaction({ ...VALID, memo: 'あ'.repeat(101) })).toHaveProperty('memo');
  });
});
