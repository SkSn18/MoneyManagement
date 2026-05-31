// CSVフィールドをエスケープする（RFC 4180 準拠）
function escapeCsvField(value) {
  const str = String(value == null ? '' : value);
  // カンマ・改行・ダブルクォートを含む場合はダブルクォートで囲む
  if (str.includes(',') || str.includes('\r') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// 取引配列をCSV文字列に変換する
// categories.js の getCategoryById と format.js の formatType に依存する
function transactionsToCsv(transactions) {
  const headers = ['日付', '種別', 'カテゴリ', '金額', 'メモ'];
  const rows = transactions.map(tx => {
    const cat = getCategoryById(tx.categoryId);
    return [
      tx.date,
      formatType(tx.type),
      cat ? cat.name : tx.categoryId,
      tx.amount,
      tx.memo || '',
    ].map(escapeCsvField).join(',');
  });
  return [headers.map(escapeCsvField).join(','), ...rows].join('\r\n');
}

// UTF-8 BOM付きCSVとしてダウンロードする
// ﻿（BOM）を付けることでExcelが日本語を正しく認識する
function downloadCsv(csvString, filename) {
  const bom  = '﻿';
  const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const _TYPE_MAP = { '収入': 'income', '支出': 'expense', '資産': 'asset' };

// CSV文字列を2次元配列に変換する（RFC 4180 準拠・BOM対応）
function parseCsv(csvString) {
  const str  = csvString.replace(/^﻿/, '');
  const rows = [];
  let row      = [];
  let field    = '';
  let inQuotes = false;

  for (let i = 0; i < str.length; i++) {
    const ch   = str[i];
    const next = str[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"')            { inQuotes = false; }
      else                            { field += ch; }
    } else {
      if      (ch === '"')                  { inQuotes = true; }
      else if (ch === ',')                  { row.push(field); field = ''; }
      else if (ch === '\r' && next === '\n') { row.push(field); field = ''; rows.push(row); row = []; i++; }
      else if (ch === '\n')                 { row.push(field); field = ''; rows.push(row); row = []; }
      else                                  { field += ch; }
    }
  }
  if (row.length > 0 || field !== '') { row.push(field); rows.push(row); }
  return rows.filter(r => r.some(f => f.trim() !== ''));
}

// CSV の2次元配列（ヘッダー行込み）を取引オブジェクト配列に変換する
// 戻り値: { valid: Transaction[], errors: string[] }
function csvToTransactions(rows) {
  const valid  = [];
  const errors = [];

  if (rows.length < 2) {
    errors.push('データが見つかりません（ヘッダー行のみか空ファイルです）');
    return { valid, errors };
  }

  for (let i = 1; i < rows.length; i++) {
    const row    = rows[i];
    const rowNum = i + 1;
    const [date, typeJa, catName, amountStr, memo = ''] = row;

    if (!date || isNaN(Date.parse(date))) {
      errors.push(`${rowNum}行目: 無効な日付「${date || '空'}」`);
      continue;
    }

    const type = _TYPE_MAP[typeJa];
    if (!type) {
      errors.push(`${rowNum}行目: 無効な種別「${typeJa || '空'}」（収入/支出/資産のいずれか）`);
      continue;
    }

    const cat = getCategoriesByType(type).find(c => c.name === catName);
    if (!cat) {
      errors.push(`${rowNum}行目: カテゴリ「${catName || '空'}」が見つかりません`);
      continue;
    }

    const amount = Number(amountStr);
    if (!Number.isInteger(amount) || amount < 1 || amount > 100000000) {
      errors.push(`${rowNum}行目: 無効な金額「${amountStr || '空'}」（1〜100,000,000の整数）`);
      continue;
    }

    if ((memo || '').length > 100) {
      errors.push(`${rowNum}行目: メモが100文字を超えています`);
      continue;
    }

    valid.push({ type, amount, categoryId: cat.id, date, memo: memo || '' });
  }

  return { valid, errors };
}

// 取込テンプレートCSV（ヘッダー行のみ）をダウンロードする
function downloadCsvTemplate() {
  downloadCsv('日付,種別,カテゴリ,金額,メモ', '家計簿_取込テンプレート.csv');
}

// 全取引データを JSON ファイルとしてダウンロードする
function downloadJson(transactions, filename) {
  const payload = { version: 1, exportedAt: new Date().toISOString(), transactions };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// JSON バックアップ文字列を解析して取引配列を返す
// 戻り値: { transactions: Transaction[]|null, error: string|null }
function parseJsonBackup(jsonString) {
  let data;
  try { data = JSON.parse(jsonString); } catch {
    return { transactions: null, error: 'JSONの解析に失敗しました。ファイルを確認してください。' };
  }
  if (!data || !Array.isArray(data.transactions)) {
    return { transactions: null, error: 'バックアップファイルの形式が正しくありません。' };
  }
  return { transactions: data.transactions, error: null };
}

if (typeof module !== 'undefined') {
  module.exports = { escapeCsvField, transactionsToCsv, parseCsv, csvToTransactions, downloadCsvTemplate, downloadJson, parseJsonBackup };
}
