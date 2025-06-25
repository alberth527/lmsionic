# 會員紅利兌換系統

一個基於 Ionic Vue 開發的會員紅利兌換系統，提供會員登入、點數查詢、商品兌換及兌換記錄等功能。

## 專案介紹

本系統是一個完整的會員紅利兌換平台，包含以下主要功能：

- 🔐 **會員登入/驗證** - 確保會員身分，登入後才可查看點數與兌換
- 💎 **紅利點數查詢** - 顯示會員目前擁有的點數
- 🛍️ **兌換商品列表** - 顯示可兌換的商品，含所需點數、圖片與描述
- ✅ **商品兌換申請** - 點擊商品後，檢查點數是否足夠並執行兌換流程
- 📋 **兌換紀錄查詢** - 顯示會員過去的兌換紀錄

## 技術架構

- **前端框架**: Vue 3 + TypeScript
- **UI 框架**: Ionic 7
- **路由管理**: Vue Router 4
- **構建工具**: Vite
- **移動端支援**: Capacitor

## 專案結構

```
src/
├── components/          # 可重用組件
├── views/              # 頁面組件
│   ├── Login.vue       # 登入頁面
│   ├── Dashboard.vue   # 會員中心
│   ├── ProductList.vue # 商品列表
│   ├── ExchangeConfirm.vue # 兌換確認
│   └── ExchangeHistory.vue # 兌換記錄
├── services/           # 業務邏輯服務
│   ├── auth.ts         # 會員認證服務
│   └── product.ts      # 商品相關服務
├── types/              # TypeScript 類型定義
│   └── index.ts
├── router/             # 路由配置
│   └── index.ts
├── theme/              # 主題樣式
│   └── variables.css
├── App.vue             # 根組件
├── main.ts             # 應用程式入口
└── shims-vue.d.ts      # Vue 類型宣告
```

## 快速開始

### 環境需求

- Node.js 16.x 或更高版本
- npm 或 yarn 套件管理器

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd lmsionic
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

4. **開啟瀏覽器**
   ```
   http://localhost:5173
   ```

### 其他指令

```bash
# 建置專案
npm run build

# 預覽建置結果
npm run preview

# 執行測試
npm run test:unit

# 程式碼檢查
npm run lint
```

## 功能說明

### 1. 會員登入 (`/login`)

- **測試帳號**: demo
- **測試密碼**: 123456
- 使用簡易 Token 模擬會員認證
- 登入成功後導向會員中心

### 2. 會員中心 (`/dashboard`)

- 顯示會員基本資訊
- 目前擁有的紅利點數
- 快捷功能入口
- 最近兌換記錄預覽

### 3. 商品列表 (`/products`)

- 顯示所有可兌換商品
- 商品圖片、名稱、描述
- 所需點數資訊
- 點數足夠狀態提示

### 4. 兌換確認 (`/exchange/:id`)

- 商品詳細資訊
- 點數計算（目前點數 vs 所需點數）
- 兌換後剩餘點數預覽
- 確認兌換按鈕

### 5. 兌換記錄 (`/history`)

- 完整兌換歷史記錄
- 商品名稱、兌換時間、使用點數
- 兌換狀態（已完成/處理中/已取消）
- 統計資訊（總兌換次數、累計使用點數等）

## 資料結構

### 會員資料 (Member)
```typescript
interface Member {
  id: string
  username: string
  email: string
  points: number
  avatar?: string
}
```

### 商品資料 (Product)
```typescript
interface Product {
  id: string
  name: string
  description: string
  image: string
  requiredPoints: number
  category: string
  available: boolean
}
```

### 兌換記錄 (ExchangeRecord)
```typescript
interface ExchangeRecord {
  id: string
  memberId: string
  productId: string
  productName: string
  productImage: string
  pointsUsed: number
  exchangeDate: string
  status: 'completed' | 'pending' | 'cancelled'
}
```

## 模擬資料

系統使用 localStorage 來模擬資料持久化：

- **會員認證**: 使用假資料驗證 (demo/123456)
- **會員點數**: 預設 1500 點
- **商品資料**: 內建 6 個模擬商品
- **兌換記錄**: 儲存在瀏覽器本地存儲

## 響應式設計

- 支援桌面端與行動裝置
- 使用 Ionic 的 Grid 系統
- 適配不同螢幕尺寸
- CSS Grid 與 Flexbox 布局

## 開發特色

### 1. TypeScript 支援
- 完整的類型定義
- 編譯時期錯誤檢查
- 更好的開發體驗

### 2. 組件化架構
- 可重用的 Vue 組件
- 清晰的職責分離
- 易於維護和擴展

### 3. 服務層設計
- 將業務邏輯從組件中分離
- 統一的 API 介面
- 可測試的服務類別

### 4. 路由守衛
- 自動檢查登入狀態
- 未登入用戶自動重導向
- 保護需要認證的頁面

## 部署指南

### 網頁版部署

1. **建置專案**
   ```bash
   npm run build
   ```

2. **上傳 dist 資料夾**
   將 `dist/` 資料夾內容上傳到網頁伺服器

### 行動 App 部署

1. **新增平台**
   ```bash
   npx cap add ios
   npx cap add android
   ```

2. **建置並同步**
   ```bash
   npm run build
   npx cap sync
   ```

3. **開啟原生專案**
   ```bash
   npx cap open ios
   npx cap open android
   ```

## 瀏覽器支援

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)
- iOS Safari
- Android Chrome

## 授權

MIT License

## 貢獻指南

1. Fork 此專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

## 聯絡資訊

如有任何問題或建議，請聯絡：

- 專案維護者: [Your Name]
- Email: [your.email@example.com]
- GitHub: [your-github-username]

---

**注意**: 此專案為演示用途，使用模擬資料。在正式環境中，請整合真實的後端 API 服務。
