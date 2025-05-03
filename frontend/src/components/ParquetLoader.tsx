/**
 * ParquetファイルをロードするためのUIコンポーネント
 * 
 * 概要:
 * - 日付範囲を選択するUIを提供
 * - useParquetLoaderフックを使用してデータをロード
 * - ロード状態とエラーを表示
 * 
 * 再生成プロンプト:
 * "ParquetファイルをロードするためのUIコンポーネントを作成してください。
 * 日付範囲を選択するための入力フィールドと、
 * データ取得ボタンを実装してください。
 * useParquetLoaderフックを使用してデータをロードし、
 * ロード状態とエラーを表示するようにしてください。"
 */

import { useState } from 'react'
import { useParquetLoader } from '../hooks/useParquetLoader'

interface ParquetLoaderProps {
  onLoadComplete?: (tableName: string) => void
}

export const ParquetLoader = ({ onLoadComplete }: ParquetLoaderProps) => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const { loadParquet, loading, error } = useParquetLoader()

  const handleLoad = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return

    const tableName = await loadParquet(dateRange)
    if (tableName && onLoadComplete) {
      onLoadComplete(tableName)
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <h2>GAデータの取得</h2>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          style={{ padding: '0.5rem' }}
        />
        <span>〜</span>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          style={{ padding: '0.5rem' }}
        />
        <button
          onClick={handleLoad}
          disabled={loading || !dateRange.startDate || !dateRange.endDate}
          style={{ padding: '0.5rem 1rem' }}
        >
          {loading ? '取得中...' : 'データ取得'}
        </button>
      </div>
      {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  )
} 
