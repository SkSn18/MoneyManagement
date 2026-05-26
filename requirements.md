# 家計簿アプリ 要件定義

## 目的・背景

AI駆動開発の学習・JavaScript/フロントエンド理解・実務的な設計経験の習得を目的とした個人用家計簿アプリ。

---

## 1. MVP機能（Phase 1）

| 機能 | 詳細 |
|------|------|
| 取引の追加 | 日付・金額・種別・カテゴリ・メモを入力 |
| 取引の編集・削除 | 一覧から選択して変更／削除 |
| 月次一覧表示 | 年月ナビゲーション付き、種別フィルタ |
| 月次サマリー | 収入合計・支出合計・資産変動・差引残高 |

---

## 2. Phase 2以降の機能（後回し）

- グラフ・可視化（カテゴリ別円グラフ、月次推移グラフ）— Chart.js
- カテゴリのカスタマイズ（追加・編集・削除）
- 予算設定・超過アラート
- CSVエクスポート / インポート
- 振替（口座間移動）
- Node.js + Express バックエンド化
- DB移行（SQLite → PostgreSQL 等）
- React 移行

---

## 3. 画面一覧

```
index.html（SPA：1ページでコンテンツを差し替える）
├── ダッシュボード  : 月次サマリー ＋ 直近取引5件
├── 取引一覧       : 月フィルタ・種別フィルタ・編集・削除
├── 取引フォーム   : 追加 / 編集 兼用
└── （Phase 2）グラフ・設定
```

---

## 4. データ構造

### Transaction（取引）

```javascript
{
  id:         "uuid-v4",              // ユニークID
  type:       "income|expense|asset", // 収入 / 支出 / 資産
  amount:     5000,                   // 金額（正の整数、円）
  categoryId: "food",                 // カテゴリID
  date:       "2026-05-25",           // ISO 8601 日付文字列
  memo:       "スーパーでの買い物",    // メモ（任意・最大100文字）
  createdAt:  "2026-05-25T12:00:00Z",
  updatedAt:  "2026-05-25T12:00:00Z"
}
```

### Category（固定カテゴリ）

カテゴリは `js/data/categories.js` に定数として定義する。
取引には `categoryId` でIDを保持し、名称は直書きしない（将来のDB外部キーと互換）。

---

## 5. ディレクトリ構成

```
MoneyManagement/
├── index.html                # エントリポイント
├── requirements.md           # 本ファイル
├── CLAUDE.md                 # プロジェクトルール
├── css/
│   ├── style.css             # レイアウト・共通スタイル
│   └── components.css        # ボタン・カード・フォーム等の部品
└── js/
    ├── main.js               # 起動・ルーティング
    ├── state.js              # 状態管理
    ├── data/
    │   ├── categories.js     # カテゴリ定数
    │   ├── storage.js        # localStorage 抽象化レイヤー
    │   └── transactions.js   # 取引 CRUD
    ├── ui/
    │   ├── dashboard.js      # ダッシュボード画面
    │   ├── list.js           # 取引一覧画面
    │   └── form.js           # 取引フォーム画面
    └── utils/
        ├── date.js           # 日付ユーティリティ
        ├── format.js         # 金額フォーマット・エスケープ
        └── validate.js       # バリデーション
```

---

## 6. 状態管理方針

```javascript
// state.js：単一の状態オブジェクトを setState() 経由で更新する
// → ReactのuseState に近い「状態 → 描画」の一方向フローを体で覚える
setState({ currentView: 'list' });
```

- `state` を直接書き換えず、必ず `setState()` を通す
- `setState()` は自動的に `renderApp()` を呼び出して再描画する

---

## 7. localStorage 設計

| キー | 内容 |
|------|------|
| `mmapp_transactions` | 取引データ（JSON配列） |
| `mmapp_settings` | 設定（将来用） |

- プレフィックス `mmapp_` で他アプリとの衝突を防ぐ
- `async/await` で実装し、将来の `fetch()` 差し替えに備える
- `try-catch` で容量上限エラーを適切に処理する

---

## 8. バックエンド/API化を見据えた設計ポイント

| 今の実装 | 将来の変更先 |
|---------|-------------|
| `storage.js` の localStorage | `fetch('/api/transactions', ...)` |
| `async/await` で統一 | そのまま使える |
| UUIDv4 形式の ID | PostgreSQL UUID 型と互換 |
| ISO 8601 日付文字列 | DB の DATE 型と互換 |
| カテゴリIDによる参照 | 外部キーとして使える |

---

## 9. DB化を見据えた設計ポイント

```
transactions テーブル
  id (UUID PK), type, amount, category_id (FK→categories), date, memo,
  created_at, updated_at

categories テーブル
  id (VARCHAR PK), name, type, icon
```

---

## 10. セキュリティ・バリデーション

- 金額: 正の整数・上限1億円（`validateTransaction()` で検証）
- 日付: `Date.parse()` で有効性確認
- メモ: 最大100文字
- XSS: `innerHTML` に埋め込む文字列は `escapeHtml()` を通す。テキストには `textContent` を使う
- localStorage: `try-catch` で容量上限を握りつぶさない

---

## 検証チェックリスト

- [ ] 取引の追加 → DevTools の Application > localStorage で保存を確認
- [ ] ページリロード後もデータが残ること
- [ ] 月をまたいで切り替えたとき正しくフィルタされること
- [ ] スマホ幅（375px）でレイアウトが崩れないこと
- [ ] 不正な金額（文字列・負数・空）でバリデーションエラーが出ること
- [ ] メモに `<script>alert(1)</script>` を入れてもスクリプトが実行されないこと
