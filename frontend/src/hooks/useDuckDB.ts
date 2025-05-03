/**
 * DuckDBの初期化と管理を行うカスタムフック
 * 
 * 概要:
 * - DuckDB-WASMの初期化処理
 * - ワーカーの設定
 * - メモリ管理
 * - エラーハンドリング
 * 
 * 再生成プロンプト:
 * "DuckDBの初期化と管理を行うカスタムフックを作成してください。
 * DuckDB-WASMを初期化し、ワーカーを設定して、
 * メモリ管理とエラーハンドリングを行うようにしてください。
 * コンポーネントのアンマウント時にクリーンアップ処理も実装してください。"
 */

import { useEffect, useState } from 'react'
import * as duckdb from '@duckdb/duckdb-wasm'

export const useDuckDB = () => {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initDuckDB = async () => {
      try {
        // DuckDBのバンドルを選択
        const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles()
        const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES)

        // ワーカーの初期化
        const worker = new Worker(bundle.mainWorker!)
        const logger = new duckdb.ConsoleLogger()
        const db = new duckdb.AsyncDuckDB(logger, worker)
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker)

        setDb(db)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'DuckDBの初期化に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    initDuckDB()

    // クリーンアップ
    return () => {
      if (db) {
        db.terminate()
      }
    }
  }, [])

  return { db, loading, error }
} 
