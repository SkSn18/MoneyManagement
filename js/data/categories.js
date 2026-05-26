// 将来のDB化に備え、id でカテゴリを参照する設計にしている
const CATEGORIES = [
  // --- 支出 ---
  { id: 'rent',        name: '家賃',       type: 'expense', icon: '🏠' },
  { id: 'food',        name: '食費',       type: 'expense', icon: '🍚' },
  { id: 'transport',   name: '交通費',     type: 'expense', icon: '🚃' },
  { id: 'utility',     name: '光熱費',     type: 'expense', icon: '💡' },
  { id: 'medical',     name: '医療費',     type: 'expense', icon: '🏥' },
  { id: 'education',   name: '教育費',     type: 'expense', icon: '📚' },
  { id: 'leisure',     name: '娯楽・趣味', type: 'expense', icon: '🎮' },
  { id: 'clothing',    name: '衣服',       type: 'expense', icon: '👕' },
  { id: 'other_exp',   name: 'その他支出', type: 'expense', icon: '📦' },
  // --- 収入 ---
  { id: 'salary',      name: '給料',       type: 'income',  icon: '💼' },
  { id: 'side_job',    name: '副業',       type: 'income',  icon: '💻' },
  { id: 'other_inc',   name: 'その他収入', type: 'income',  icon: '💰' },
  // --- 資産 ---
  { id: 'savings',     name: '貯金',       type: 'asset',   icon: '🏦' },
  { id: 'investment',  name: '投資',       type: 'asset',   icon: '📈' },
  { id: 'other_asset', name: 'その他資産', type: 'asset',   icon: '🪙' },
];

function getCategoriesByType(type) {
  return CATEGORIES.filter(c => c.type === type);
}

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || null;
}
