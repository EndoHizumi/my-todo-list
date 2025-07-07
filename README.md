# Vue.js Todo Application

## 概要

Vue.js 3で構築された高機能なTodoアプリケーションです。3階層のタスク管理、依存関係設定、カレンダー表示、高度な検索機能、データのインポート・エクスポート機能を備えています。

## 主な機能

### ✨ 基本機能
- ✅ タスクの作成・編集・削除・完了
- ✅ 優先度設定（高・中・低）
- ✅ 期限・予定日の設定
- ✅ カテゴリとタグ管理
- ✅ タスクの詳細説明

### 🏗️ 階層管理
- ✅ 3階層のタスク構造（親→子→孫）
- ✅ 子タスク全完了時の親タスク自動完了
- ✅ 階層表示モード

### 🔗 依存関係
- ✅ タスク間の前提条件設定
- ✅ 循環依存の検出・防止
- ✅ 依存関係の可視化グラフ
- ✅ 実行可能タスクの自動判定

### 📅 カレンダー機能
- ✅ 月・週・日表示の切り替え
- ✅ タスクのカレンダー表示
- ✅ 日付クリックでタスク追加
- ✅ 時間指定対応

### 🔍 検索・フィルタ
- ✅ テキスト検索（タイトル・説明・タグ）
- ✅ 高度なフィルタリング
  - ステータス・優先度
  - 階層レベル
  - 期限（期限切れ・今日・明日など）
  - 依存関係（ブロック中・実行可能など）
  - カテゴリ
- ✅ 検索結果のソート機能
- ✅ 検索キーワードのハイライト

### 💾 データ管理
- ✅ JSON/CSVエクスポート
- ✅ データインポート（検証機能付き）
- ✅ 自動バックアップ設定
- ✅ ストレージ使用量表示
- ✅ データの完全削除

### 📱 UI/UX
- ✅ レスポンシブデザイン
- ✅ モダンなグラスモーフィズムデザイン
- ✅ グラデーション背景
- ✅ スムーズなアニメーション
- ✅ 直感的なナビゲーション

## 技術仕様

### フロントエンド
- **Vue.js 3** - Composition API使用
- **Vite** - 高速ビルドツール
- **Vanilla CSS** - モダンCSS機能活用

### データ管理
- **LocalStorage** - ブラウザ内データ永続化
- **JSON形式** - 構造化データ保存

### アーキテクチャ
- **コンポーネントベース設計**
- **サービス層分離**
- **リアクティブデータ管理**

## セットアップ

### 必要環境
- Node.js 16.0以上
- npm または yarn

### インストール手順

1. **プロジェクトクローン**
```bash
git clone <repository-url>
cd todo-app
```

2. **依存関係のインストール**
```bash
npm install
```

3. **開発サーバー起動**
```bash
npm run dev
```

4. **ブラウザでアクセス**
```
http://localhost:3000
```

### ビルド・デプロイ

**本番ビルド**
```bash
npm run build
```

**プレビュー**
```bash
npm run preview
```

## プロジェクト構造

```
src/
├── components/           # Vueコンポーネント
│   ├── calendar/        # カレンダー関連
│   │   ├── MonthView.vue
│   │   ├── WeekView.vue
│   │   └── DayView.vue
│   ├── TaskStats.vue    # 統計表示
│   ├── TaskFilters.vue  # フィルター
│   ├── TaskList.vue     # タスク一覧
│   ├── TaskItem.vue     # タスクアイテム
│   ├── TaskHierarchy.vue # 階層表示
│   ├── TaskNode.vue     # 階層ノード
│   ├── TaskModal.vue    # タスク編集モーダル
│   ├── TaskCalendar.vue # カレンダーメイン
│   ├── SearchView.vue   # 検索画面
│   ├── SearchResultItem.vue # 検索結果
│   ├── DependencyManager.vue # 依存関係管理
│   ├── DependencyGraph.vue # 依存関係グラフ
│   └── ImportExport.vue # データ管理
├── services/            # ビジネスロジック
│   ├── localStorage.js  # ストレージ管理
│   └── taskManager.js   # タスク管理
├── types/              # データ型定義
│   └── task.js         # タスククラス
├── App.vue             # メインアプリ
└── main.js             # エントリーポイント
```

## 使用方法

### 基本操作

1. **タスク作成**
   - 「+ 新しいタスク」ボタンをクリック
   - タイトル、説明、優先度などを入力
   - 保存で完了

2. **子タスク作成**
   - 階層表示で親タスクの「+」ボタンをクリック
   - 最大3階層まで作成可能

3. **依存関係設定**
   - 「依存関係」タブを開く
   - タスクを選択し、依存するタスクを指定

4. **カレンダー表示**
   - 「カレンダー」タブで月・週・日表示切り替え
   - 日付をクリックしてタスク追加

5. **検索・フィルタ**
   - 「検索」タブで高度な検索
   - 複数条件での絞り込み可能

6. **データ管理**
   - 「データ管理」タブでエクスポート・インポート
   - 自動バックアップ設定も可能

## データ仕様

### タスクデータ構造
```javascript
{
  id: "unique_id",
  title: "タスクタイトル",
  description: "説明",
  status: "pending|in_progress|completed",
  priority: "low|medium|high",
  level: 0|1|2,  // 階層レベル
  parentId: "parent_task_id",
  childIds: ["child_id1", "child_id2"],
  dependencies: ["dep_task_id1"],
  dependents: ["dependent_task_id1"],
  createdAt: "ISO date",
  updatedAt: "ISO date",
  dueDate: "ISO date",
  scheduledDate: "ISO date",
  completedAt: "ISO date",
  tags: ["tag1", "tag2"],
  category: "category_name"
}
```

### エクスポートフォーマット
```javascript
{
  exportedAt: "ISO date",
  version: "1.0.0",
  tasks: [...],
  settings: {...},
  statistics: {...}
}
```

## カスタマイズ

### テーマの変更
`src/App.vue`のCSS変数を編集:
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-gradient: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
```

### 新機能の追加
1. `src/components/`に新しいコンポーネント作成
2. `src/services/`にビジネスロジック追加
3. `src/App.vue`でコンポーネント統合

## トラブルシューティング

### よくある問題

**Q: 開発サーバーが起動しない**
A: Node.jsバージョンを確認し、依存関係を再インストール
```bash
node --version  # 16.0以上確認
rm -rf node_modules package-lock.json
npm install
```

**Q: データが保存されない**
A: ブラウザのLocalStorageが有効か確認
- 開発者ツール → Application → Local Storage

**Q: インポートが失敗する**
A: JSONファイルの形式を確認
- 正しいデータ構造か検証
- 文字エンコーディング確認

## ライセンス

MIT License

## 作成者

このプロジェクトは要件定義に基づいて実装されました。

---

**🎯 すべての要件を満たした高機能Todoアプリケーションです！**