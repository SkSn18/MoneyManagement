const { formatYearMonth, formatDate, getNextMonth, getPrevMonth } = require('../js/utils/date');

describe('formatYearMonth', () => {
  test('2026-05 → 2026年5月', () => expect(formatYearMonth('2026-05')).toBe('2026年5月'));
  test('2026-12 → 2026年12月', () => expect(formatYearMonth('2026-12')).toBe('2026年12月'));
  test('先頭の0は取れる', () => expect(formatYearMonth('2026-01')).toBe('2026年1月'));
});

describe('formatDate', () => {
  test('2026-05-01 → 5月1日', () => expect(formatDate('2026-05-01')).toBe('5月1日'));
  test('2026-12-31 → 12月31日', () => expect(formatDate('2026-12-31')).toBe('12月31日'));
  test('先頭の0は取れる', () => expect(formatDate('2026-01-09')).toBe('1月9日'));
});

describe('getNextMonth', () => {
  test('通常の月送り', () => expect(getNextMonth('2026-05')).toBe('2026-06'));
  test('12月の次は翌年1月', () => expect(getNextMonth('2026-12')).toBe('2027-01'));
  test('月の桁数は2桁', () => expect(getNextMonth('2026-09')).toBe('2026-10'));
});

describe('getPrevMonth', () => {
  test('通常の月戻り', () => expect(getPrevMonth('2026-05')).toBe('2026-04'));
  test('1月の前は前年12月', () => expect(getPrevMonth('2026-01')).toBe('2025-12'));
  test('月の桁数は2桁', () => expect(getPrevMonth('2026-10')).toBe('2026-09'));
});
