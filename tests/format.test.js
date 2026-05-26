const { formatAmount, formatType, escapeHtml } = require('../js/utils/format');

describe('formatAmount', () => {
  test('整数を ¥1,234 形式に変換する', () => {
    expect(formatAmount(1234)).toBe('¥1,234');
  });
  test('0 は ¥0 になる', () => {
    expect(formatAmount(0)).toBe('¥0');
  });
  test('大きな数値も正しくフォーマットされる', () => {
    expect(formatAmount(1000000)).toBe('¥1,000,000');
  });
});

describe('formatType', () => {
  test('income → 収入', () => expect(formatType('income')).toBe('収入'));
  test('expense → 支出', () => expect(formatType('expense')).toBe('支出'));
  test('asset → 資産', () => expect(formatType('asset')).toBe('資産'));
  test('不明な種別はそのまま返す', () => expect(formatType('other')).toBe('other'));
});

describe('escapeHtml', () => {
  test('& をエスケープする', () => expect(escapeHtml('a&b')).toBe('a&amp;b'));
  test('< > をエスケープする', () => expect(escapeHtml('<b>text</b>')).toBe('&lt;b&gt;text&lt;/b&gt;'));
  test('" をエスケープする', () => expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;'));
  test("' をエスケープする", () => expect(escapeHtml("it's")).toBe('it&#39;s'));
  test('スクリプトタグを無効化できる', () => {
    const input  = '<script>alert(1)</script>';
    const result = escapeHtml(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });
  test('安全な文字列はそのまま返す', () => expect(escapeHtml('hello world')).toBe('hello world'));
  test('数値も文字列として処理する', () => expect(escapeHtml(123)).toBe('123'));
});
