import { useState } from 'react'

function App() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: '2025-04-01',
          endDate: '2025-04-07',
          metrics: ['activeUsers'],
          dimensions: []
        })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
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
      {data && <pre style={{ marginTop: '1rem', textAlign: 'left' }}>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}

export default App