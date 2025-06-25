import { Member, LoginForm, ApiResponse } from '@/types'

// 模擬會員資料
const mockMember: Member = {
  id: '1',
  username: 'demo_user',
  email: 'demo@example.com',
  points: 1500,
  avatar: 'https://ionicframework.com/docs/img/demos/avatar.svg'
}

// 模擬登入憑證
const mockCredentials = {
  username: 'demo',
  password: '123456'
}

class AuthService {
  private member: Member | null = null
  private token: string | null = null

  // 登入
  async login(credentials: LoginForm): Promise<ApiResponse<{ member: Member; token: string }>> {
    // 模擬 API 延遲
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (
      credentials.username === mockCredentials.username &&
      credentials.password === mockCredentials.password
    ) {
      this.token = 'mock-jwt-token-' + Date.now()
      this.member = mockMember
      
      // 儲存到 localStorage
      localStorage.setItem('auth_token', this.token)
      localStorage.setItem('member_data', JSON.stringify(this.member))

      return {
        success: true,
        data: {
          member: this.member,
          token: this.token
        },
        message: '登入成功'
      }
    }

    return {
      success: false,
      message: '帳號或密碼錯誤'
    }
  }

  // 登出
  logout() {
    this.token = null
    this.member = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('member_data')
  }

  // 檢查是否已登入
  isAuthenticated(): boolean {
    if (this.token) return true
    
    const storedToken = localStorage.getItem('auth_token')
    const storedMember = localStorage.getItem('member_data')
    
    if (storedToken && storedMember) {
      this.token = storedToken
      this.member = JSON.parse(storedMember)
      return true
    }
    
    return false
  }

  // 取得目前會員資料
  getCurrentMember(): Member | null {
    if (this.member) return this.member
    
    const storedMember = localStorage.getItem('member_data')
    if (storedMember) {
      this.member = JSON.parse(storedMember)
      return this.member
    }
    
    return null
  }

  // 更新會員點數
  updateMemberPoints(newPoints: number) {
    if (this.member) {
      this.member.points = newPoints
      localStorage.setItem('member_data', JSON.stringify(this.member))
    }
  }
}

export default new AuthService()
