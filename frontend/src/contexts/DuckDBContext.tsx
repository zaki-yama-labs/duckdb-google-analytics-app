/**
 * DuckDBのコンテキストを提供するプロバイダーコンポーネント
 * 
 * 概要:
 * - DuckDBのインスタンスをコンテキストとして提供
 * - useDuckDBフックを使用して初期化
 * - ロード状態とエラー状態も提供
 * 
 * 再生成プロンプト:
 * "DuckDBのコンテキストを提供するプロバイダーコンポーネントを作成してください。
 * useDuckDBフックを使用してDuckDBを初期化し、
 * コンテキストとして提供するようにしてください。
 * ロード状態とエラー状態もコンテキストに含めてください。"
 */

import { createContext, useContext, ReactNode } from 'react'
import * as duckdb from '@duckdb/duckdb-wasm'
import { useDuckDB } from '../hooks/useDuckDB'

interface DuckDBContextType {
  db: duckdb.AsyncDuckDB | null
  loading: boolean
  error: string | null
}

const DuckDBContext = createContext<DuckDBContextType | null>(null)

export const useDuckDBContext = () => {
  const context = useContext(DuckDBContext)
  if (!context) {
    throw new Error('useDuckDBContext must be used within a DuckDBProvider')
  }
  return context
}

interface DuckDBProviderProps {
  children: ReactNode
}

export const DuckDBProvider = ({ children }: DuckDBProviderProps) => {
  const { db, loading, error } = useDuckDB()

  return (
    <DuckDBContext.Provider value={{ db, loading, error }}>
      {children}
    </DuckDBContext.Provider>
  )
} 
