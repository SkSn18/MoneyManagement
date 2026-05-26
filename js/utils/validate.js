// エラーがあれば { フィールド名: 'エラーメッセージ' } を返す
// エラーがなければ空オブジェクト {} を返す
function validateTransaction(input) {
  const errors = {};

  if (!['income', 'expense', 'asset'].includes(input.type)) {
    errors.type = '種別を選択してください';
  }

  const amount = Number(input.amount);
  if (!input.amount || isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
    errors.amount = '金額は1円以上の整数で入力してください';
  } else if (amount > 100000000) {
    errors.amount = '金額は1億円以下で入力してください';
  }

  if (!input.categoryId) {
    errors.categoryId = 'カテゴリを選択してください';
  }

  if (!input.date) {
    errors.date = '日付を入力してください';
  } else if (isNaN(Date.parse(input.date))) {
    errors.date = '有効な日付を入力してください';
  }

  if (input.memo && input.memo.length > 100) {
    errors.memo = 'メモは100文字以内で入力してください';
  }

  return errors;
}

if (typeof module !== 'undefined') {
  module.exports = { validateTransaction };
}
