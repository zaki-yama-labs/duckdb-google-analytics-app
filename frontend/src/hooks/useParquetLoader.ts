/**
 * DuckDBにParquetファイルをロードするためのカスタムフック
 * 
 * 概要:
 * - 日付範囲を指定してGA4データを取得
 * - バックエンドから署名付きURLを取得
 * - DuckDBにテーブルとしてロード
 * 
 * 再生成プロンプト:
 * "DuckDBにParquetファイルをロードするカスタムフックを作成してください。
 * 日付範囲を引数として受け取り、バックエンドから署名付きURLを取得して、
 * DuckDBにテーブルとしてロードする機能を実装してください。
 * ロード状態とエラー状態も管理してください。"
 */

import { useState } from 'react'
import * as duckdb from '@duckdb/duckdb-wasm'
import { useDuckDBContext } from '../contexts/DuckDBContext'

interface DateRange {
  startDate: string
  endDate: string
}

export const useParquetLoader = () => {
  const { db } = useDuckDBContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadParquet = async (dateRange: DateRange) => {
    if (!db) {
      throw new Error('DuckDBが初期化されていません')
    }

    setLoading(true)
    setError(null)

    try {
      // バックエンドから署名付きURLを取得
      const res = await fetch('/api/ga/parquet-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dateRange)
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }

      const { url } = await res.json()
      const tableName = `ga_data_${dateRange.startDate}_${dateRange.endDate}`

      // DuckDBにテーブルとしてロード
      const conn = await db.connect()
      await conn.query(`CREATE TABLE ${tableName} AS SELECT * FROM parquet_scan('${url}')`)
      await conn.close()

      return tableName
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parquetファイルのロードに失敗しました')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loadParquet, loading, error }
} 
