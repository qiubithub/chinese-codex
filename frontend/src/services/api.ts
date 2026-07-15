import axios from 'axios'
import type { ApiResponse, HomeOverview } from '../types'

const http = axios.create({
  baseURL: '/api',
  timeout: 8000,
})

export async function getHomeOverview() {
  const response = await http.get<ApiResponse<HomeOverview>>('/home/overview')
  return response.data.data
}
