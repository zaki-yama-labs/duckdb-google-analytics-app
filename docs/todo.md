# TODO

## フェーズ1: GAデータ取得→画面表示

### バックエンド
- [x] Wrangler プロジェクトを初期化
- [x] Cloudflare Workers の環境変数設定（サービスアカウントJSON、GA4プロパティID）
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
- [ ] DuckDB-WASM の初期セットアップ
- [ ] Parquet ダウンロード & DuckDB テーブルロード
- [ ] SQL クエリエディタ実装（Monaco Editor 組み込み）
