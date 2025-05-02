import { mockGA4Response } from '../mockData'
import './DataTable.css'

type GA4Response = typeof mockGA4Response

interface DataTableProps {
  data: GA4Response
}

export const DataTable = ({ data }: DataTableProps) => {
  return (
    <table style={{ 
      borderCollapse: 'collapse',
      width: '100%',
      marginTop: '1rem',
      textAlign: 'left'
    }}>
      <thead>
        <tr>
          {data.dimensionHeaders.map((header) => (
            <th key={header.name} style={{ 
              padding: '0.5rem',
              borderBottom: '2px solid #ddd'
            }}>
              {header.name}
            </th>
          ))}
          {data.metricHeaders.map((header) => (
            <th key={header.name} style={{ 
              padding: '0.5rem',
              borderBottom: '2px solid #ddd'
            }}>
              {header.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, index) => (
          <tr key={index} style={{ 
            borderBottom: '1px solid #ddd'
          }} className="data-table-row">
            {row.dimensionValues.map((value, i) => (
              <td key={i} style={{ padding: '0.5rem' }}>
                {value.value}
              </td>
            ))}
            {row.metricValues.map((value, i) => (
              <td key={i} style={{ padding: '0.5rem' }}>
                {value.value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
} 
