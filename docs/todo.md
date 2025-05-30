# TODO

## フェーズ1: GAデータ取得→画面表示

### バックエンド
- [x] ~~Wrangler プロジェクトを初期化~~
- [x] ~~Cloudflare Workers の環境変数設定~~
- [x] Google Cloud プロジェクトのセットアップ
  - [x] プロジェクト作成
  - [x] サービスアカウント設定
  - [x] 必要なAPIの有効化（Cloud Functions, Cloud Storage, etc.）
- [x] `/api/ga` エンドポイント実装
  - [x] GA4 Data API へのリクエスト (Fetch API)
  - [x] レスポンス(JSON)をそのまま返却

### フロントエンド
- [x] React + Vite + TypeScript プロジェクトを初期化
- [x] 「GAデータ取得」ボタンとプレースホルダーの画面を作成
- [x] API呼び出し（`fetch('/api/ga')`）の実装
- [x] レスポンス(JSON)をテーブルまたは `<pre>` で表示

### 動作確認
- [x] サービスアカウントを使った本番データ取得の確認
- [x] モックレスポンスを使ったフロント部の並行開発

## フェーズ2: Parquet読み込み & SQL実行基盤
- [x] DuckDB-WASM の初期セットアップ
  - [x] DuckDB-WASM パッケージのインストール
  - [x] 初期化処理の実装
  - [x] メモリ管理の設定
- [ ] バックエンド実装
  - [x] Cloud Functions プロジェクトの初期化
  - [ ] `/api/ga/parquet-url` エンドポイントの実装
  - [ ] DuckDBを使用したParquet変換処理の実装
  - [ ] Cloud Storageの署名付きURL生成処理
  - [ ] 日付範囲に基づくParquetファイルの特定
- [ ] フロントエンド改善
  - [ ] テーブル一覧の表示コンポーネントの実装
  - [ ] テーブル名の重複チェックと管理
  - [ ] エラーメッセージの日本語化
  - [ ] ローディング状態の視覚的フィードバック
- [ ] SQL クエリエディタ実装（Monaco Editor 組み込み）
  - [ ] Monaco Editor のインストールと初期設定
  - [ ] SQL シンタックスハイライトの設定
  - [ ] クエリ実行ボタンと結果表示の連携

### バッチ処理（自動化）
- [ ] GAデータ自動取得・Cloud Storage保存バッチ
  - [ ] Cloud Scheduler（Cron）の設定
  - [ ] Cloud Functions トリガーの実装
  - [ ] GA4 Data APIから指定日のデータ取得
  - [ ] jsonl.gzまたはParquetへの変換処理
  - [ ] Cloud Storageへのアップロード

## フェーズ3: 結果表示 & 可視化
- [ ] テーブル表示 (TanStack Table)
  - [ ] TanStack Table のインストールと設定
  - [ ] カスタムカラムの実装
  - [ ] ソート・フィルター機能の追加
- [ ] グラフ表示 (Chart.js)
  - [ ] Chart.js のインストールと初期設定
  - [ ] 折れ線グラフの実装
  - [ ] 棒グラフの実装
- [ ] 標準クエリテンプレート作成 & UI 連携
  - [ ] テンプレートの定義
  - [ ] テンプレート選択UIの実装
  - [ ] パラメータ入力フォームの実装

## フェーズ4: データ & クエリの保存・キャッシュ
- [ ] OPFS / IndexedDB による Parquet データキャッシュ
  - [ ] キャッシュストラテジーの設計
  - [ ] OPFS/IndexedDB の実装
  - [ ] キャッシュ有効期限の管理
- [ ] クエリ保存・ロード機能
  - [ ] クエリ保存UIの実装
  - [ ] 保存したクエリの一覧表示
  - [ ] クエリの編集・削除機能
- [ ] シークレットモード／設定管理
  - [ ] シークレットモードの切り替えUI
  - [ ] 設定保存機能の実装
  - [ ] 設定のインポート/エクスポート機能

## フェーズ5: 拡張機能（オプション）
- [ ] 時系列比較 / セグメント分析 UI
- [ ] クエリ共有・インポート (URL パラメータ)
- [ ] ノーコードモード (UI ベースのクエリ自動生成)
- [ ] スケジューリング（擬似定期実行）

## フェーズ6: テスト & ドキュメント整備
- [ ] ユニットテスト・E2E テストの整備
  - [ ] バックエンドのエンドポイントのテスト
  - [ ] フロントエンドのコンポーネントのテスト
  - [ ] エラーハンドリングのテスト
- [ ] ドキュメント更新（README, Wiki, スニペット）
- [ ] CI/CD パイプライン設計・導入
- [ ] パフォーマンス・セキュリティレビュー
