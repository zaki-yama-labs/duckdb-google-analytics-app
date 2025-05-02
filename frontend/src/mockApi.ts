import { mockGA4Response } from './mockData'

export const mockApi = {
  fetchGA4Data: async () => {
    // 実際のAPIと同様の遅延を模擬
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockGA4Response
  }
} 
