export const mockGA4Response = {
  dimensionHeaders: [
    { name: 'date' }
  ],
  metricHeaders: [
    { name: 'activeUsers', type: 'TYPE_INTEGER' }
  ],
  rows: [
    {
      dimensionValues: [{ value: '2024-04-01' }],
      metricValues: [{ value: '100' }]
    },
    {
      dimensionValues: [{ value: '2024-04-02' }],
      metricValues: [{ value: '120' }]
    },
    {
      dimensionValues: [{ value: '2024-04-03' }],
      metricValues: [{ value: '150' }]
    },
    {
      dimensionValues: [{ value: '2024-04-04' }],
      metricValues: [{ value: '130' }]
    },
    {
      dimensionValues: [{ value: '2024-04-05' }],
      metricValues: [{ value: '140' }]
    },
    {
      dimensionValues: [{ value: '2024-04-06' }],
      metricValues: [{ value: '160' }]
    },
    {
      dimensionValues: [{ value: '2024-04-07' }],
      metricValues: [{ value: '180' }]
    }
  ],
  rowCount: 7,
  metadata: {
    currencyCode: 'JPY',
    timeZone: 'Asia/Tokyo'
  }
} 
