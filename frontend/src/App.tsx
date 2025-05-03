import { useState } from 'react'
import { mockApi } from './mockApi'
import { DataTable } from './components/DataTable'
import { DuckDBProvider } from './contexts/DuckDBContext'
import { ParquetLoader } from './components/ParquetLoader'

const isDevelopment = import.meta.env.DEV

function App() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedTables, setLoadedTables] = useState<string[]>([])

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isDevelopment) {
        const mockData = await mockApi.fetchGA4Data()
        setData(mockData)
      } else {
        const res = await fetch('/api/ga', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: '2024-04-01',
            endDate: '2024-04-07',
            metrics: ['activeUsers'],
            dimensions: ['date']
          })
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setData(json)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadComplete = (tableName: string) => {
    setLoadedTables(prev => [...prev, tableName])
  }

  return (
    <DuckDBProvider>
      <div style={{ padding: '2rem' }}>
        <h1>GA データ取得</h1>
        <button disabled={loading} onClick={handleFetch}>
          {loading ? '取得中...' : 'GAデータ取得'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {data && <DataTable data={data} />}
        
        <ParquetLoader onLoadComplete={handleLoadComplete} />
        {loadedTables.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h3>ロード済みテーブル</h3>
            <ul>
              {loadedTables.map(table => (
                <li key={table}>{table}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DuckDBProvider>
  )
}

export default App
