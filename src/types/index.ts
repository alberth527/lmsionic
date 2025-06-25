// 會員資料類型
export interface Member {
  id: string
  username: string
  email: string
  points: number
  avatar?: string
}

// 商品資料類型
export interface Product {
  id: string
  name: string
  description: string
  image: string
  requiredPoints: number
  category: string
  available: boolean
}

// 兌換記錄類型
export interface ExchangeRecord {
  id: string
  memberId: string
  productId: string
  productName: string
  productImage: string
  pointsUsed: number
  exchangeDate: string
  status: 'completed' | 'pending' | 'cancelled'
}

// 登入表單類型
export interface LoginForm {
  username: string
  password: string
}

// API 回應類型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}
