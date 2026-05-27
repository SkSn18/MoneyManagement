// アプリ全体の状態を管理する（React の useState に相当するパターン）
// state を直接書き換えず、必ず setState() を通すことで変更の追跡がしやすくなる

const appState = {
  currentView:      'dashboard',
  currentYearMonth: getCurrentYearMonth(),
  transactions:     [],
  editingId:        null,
  filterType:       'all',
  displayMode:      'monthly',  // 'monthly' | 'yearly' | 'cumulative'
};

let _renderer = null;

function setRenderer(fn) {
  _renderer = fn;
}

// setState({ currentView: 'list' }) のように差分だけ渡す
function setState(partial) {
  Object.assign(appState, partial);
  if (_renderer) _renderer();
}

// 読み取り専用として使うこと
function getState() {
  return appState;
}
