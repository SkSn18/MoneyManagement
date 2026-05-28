const { formatYearMonth, formatDate, getNextMonth, getPrevMonth, getMonthRange, getCurrentYearMonth } = require('../js/utils/date');

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

describe('getMonthRange', () => {
  const current = getCurrentYearMonth();

  test('空配列のとき現在月のみ返す', () => {
    expect(getMonthRange([])).toEqual([current]);
  });

  test('nullのとき現在月のみ返す', () => {
    expect(getMonthRange(null)).toEqual([current]);
  });

  test('過去月のみのとき最古月から現在月まで連続で返す', () => {
    const txs = [{ date: '2026-03-01' }, { date: '2026-01-15' }];
    const range = getMonthRange(txs);
    expect(range[0]).toBe('2026-01');
    expect(range[range.length - 1]).toBe(current >= '2026-03' ? current : '2026-03');
    // 連続していることを確認
    for (let i = 1; i < range.length; i++) {
      expect(range[i]).toBe(getNextMonth(range[i - 1]));
    }
  });

  test('未来月を含むとき最新取引月まで範囲が伸びる', () => {
    const txs = [
      { date: '2026-05-01' },
      { date: '2099-06-15' },
    ];
    const range = getMonthRange(txs);
    expect(range[range.length - 1]).toBe('2099-06');
  });

  test('全データが未来月のとき最古月から最新月まで返す', () => {
    const txs = [
      { date: '2099-01-01' },
      { date: '2099-03-15' },
    ];
    const range = getMonthRange(txs);
    expect(range[0]).toBe('2099-01');
    expect(range[range.length - 1]).toBe('2099-03');
    expect(range).toHaveLength(3);
  });

  test('1件だけのとき1要素以上の配列を返す', () => {
    const txs = [{ date: '2026-04-10' }];
    const range = getMonthRange(txs);
    expect(range.length).toBeGreaterThanOrEqual(1);
    expect(range[0]).toBe('2026-04');
  });
});
