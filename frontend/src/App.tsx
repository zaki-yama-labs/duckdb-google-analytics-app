import { useState } from 'react'
import { mockApi } from './mockApi'
import { DataTable } from './components/DataTable'

const isDevelopment = import.meta.env.DEV

function App() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div style={{ padding: '2rem' }}>
      <h1>GA データ取得</h1>
      <button disabled={loading} onClick={handleFetch}>
        {loading ? '取得中...' : 'GAデータ取得'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && <DataTable data={data} />}
    </div>
  )
}

export default App
