// アプリ固有のプレフィックスを付けて他アプリとの衝突を防ぐ
const STORAGE_KEYS = {
  TRANSACTIONS:      'mmapp_transactions',
  SETTINGS:          'mmapp_settings',
  CURRENT_VIEW:      'mmapp_current_view',
  RECURRING:         'mmapp_recurring',
  BUDGETS:           'mmapp_budgets',
  CUSTOM_CATEGORIES: 'mmapp_custom_categories',
};

// async/await で書いておくと、将来 fetch() に差し替えるときに呼び出し側を変えなくて済む
async function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('取引データの読み込みに失敗しました:', e);
    return [];
  }
}

async function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    // localStorage の容量上限（約5MB）に達したとき
    console.error('取引データの保存に失敗しました:', e);
    showBanner('error', '保存に失敗しました。ストレージの空き容量を確認してください。');
  }
}

async function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

async function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('設定の保存に失敗しました:', e);
  }
}

function saveCurrentView(view) {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, view);
  } catch (e) {}
}

function loadCurrentView() {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_VIEW) || 'dashboard';
  } catch (e) {
    return 'dashboard';
  }
}

async function loadRecurring() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECURRING);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function saveRecurring(recurring) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurring));
  } catch (e) {
    console.error('繰り返し取引の保存に失敗しました:', e);
  }
}

async function loadBudgets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

async function saveBudgets(budgets) {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error('予算の保存に失敗しました:', e);
  }
}

async function loadCustomCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function saveCustomCategories(cats) {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(cats));
  } catch (e) {
    console.error('カテゴリの保存に失敗しました:', e);
  }
}
