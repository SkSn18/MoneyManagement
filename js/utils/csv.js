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

if (typeof module !== 'undefined') {
  module.exports = { escapeCsvField, transactionsToCsv };
}
