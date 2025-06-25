import { Product, ExchangeRecord, ApiResponse } from '@/types'
import authService from './auth'

// 模擬商品資料
const mockProducts: Product[] = [
  {
    id: '1',
    name: '星巴克咖啡券',
    description: '可兌換星巴克任一飲品（價值150元以下）',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop',
    requiredPoints: 300,
    category: '飲品',
    available: true
  },
  {
    id: '2',
    name: '7-11購物金100元',
    description: '7-11便利商店購物金100元，可購買任何商品',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop',
    requiredPoints: 200,
    category: '購物金',
    available: true
  },
  {
    id: '3',
    name: '電影票券',
    description: '威秀影城電影票券一張（不限場次）',
    image: 'https://images.unsplash.com/photo-1489599858156-6c5a2c67a65b?w=300&h=200&fit=crop',
    requiredPoints: 500,
    category: '娛樂',
    available: true
  },
  {
    id: '4',
    name: 'McDonald\'s套餐券',
    description: '麥當勞套餐券，可兌換指定套餐一份',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop',
    requiredPoints: 250,
    category: '餐飲',
    available: true
  },
  {
    id: '5',
    name: 'Amazon購物金500元',
    description: 'Amazon線上購物金500元，購買任何商品',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
    requiredPoints: 1000,
    category: '購物金',
    available: true
  },
  {
    id: '6',
    name: 'Spotify Premium 3個月',
    description: 'Spotify Premium會員資格3個月',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
    requiredPoints: 600,
    category: '數位服務',
    available: false
  }
]

class ProductService {
  // 取得所有商品
  async getProducts(): Promise<ApiResponse<Product[]>> {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      success: true,
      data: mockProducts.filter(p => p.available),
      message: '商品列表載入成功'
    }
  }

  // 根據 ID 取得商品
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const product = mockProducts.find(p => p.id === id)
    
    if (product) {
      return {
        success: true,
        data: product,
        message: '商品資料載入成功'
      }
    }

    return {
      success: false,
      message: '找不到指定商品'
    }
  }

  // 兌換商品
  async exchangeProduct(productId: string): Promise<ApiResponse<ExchangeRecord>> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const member = authService.getCurrentMember()
    const product = mockProducts.find(p => p.id === productId)

    if (!member) {
      return {
        success: false,
        message: '請先登入'
      }
    }

    if (!product) {
      return {
        success: false,
        message: '找不到指定商品'
      }
    }

    if (!product.available) {
      return {
        success: false,
        message: '此商品目前無法兌換'
      }
    }

    if (member.points < product.requiredPoints) {
      return {
        success: false,
        message: '點數不足，無法兌換此商品'
      }
    }

    // 扣除點數
    const newPoints = member.points - product.requiredPoints
    authService.updateMemberPoints(newPoints)

    // 建立兌換記錄
    const exchangeRecord: ExchangeRecord = {
      id: 'ex_' + Date.now(),
      memberId: member.id,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      pointsUsed: product.requiredPoints,
      exchangeDate: new Date().toISOString(),
      status: 'completed'
    }

    // 儲存兌換記錄
    this.saveExchangeRecord(exchangeRecord)

    return {
      success: true,
      data: exchangeRecord,
      message: '兌換成功！'
    }
  }

  // 取得兌換記錄
  async getExchangeHistory(): Promise<ApiResponse<ExchangeRecord[]>> {
    await new Promise(resolve => setTimeout(resolve, 500))

    const member = authService.getCurrentMember()
    if (!member) {
      return {
        success: false,
        message: '請先登入'
      }
    }

    const records = this.getStoredExchangeRecords()
    const memberRecords = records.filter(r => r.memberId === member.id)

    return {
      success: true,
      data: memberRecords.sort((a, b) => 
        new Date(b.exchangeDate).getTime() - new Date(a.exchangeDate).getTime()
      ),
      message: '兌換記錄載入成功'
    }
  }

  // 儲存兌換記錄到 localStorage
  private saveExchangeRecord(record: ExchangeRecord) {
    const records = this.getStoredExchangeRecords()
    records.push(record)
    localStorage.setItem('exchange_records', JSON.stringify(records))
  }

  // 從 localStorage 取得兌換記錄
  private getStoredExchangeRecords(): ExchangeRecord[] {
    const stored = localStorage.getItem('exchange_records')
    return stored ? JSON.parse(stored) : []
  }
}

export default new ProductService()
