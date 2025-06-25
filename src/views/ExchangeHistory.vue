<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>兌換記錄</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="history-container">
        <!-- 載入中 -->
        <div v-if="loading" class="loading-container">
          <ion-spinner></ion-spinner>
          <p>載入兌換記錄中...</p>
        </div>

        <!-- 兌換記錄列表 -->
        <div v-else-if="exchangeRecords.length > 0" class="records-list">
          <ion-card
            v-for="record in exchangeRecords"
            :key="record.id"
            class="record-card"
          >
            <ion-card-content>
              <div class="record-item">
                <!-- 商品圖片 -->
                <div class="product-image-container">
                  <img
                    :src="record.productImage"
                    :alt="record.productName"
                    class="product-image"
                  />
                </div>

                <!-- 兌換詳情 -->
                <div class="record-details">
                  <h3 class="product-name">{{ record.productName }}</h3>
                  
                  <div class="record-meta">
                    <div class="exchange-date">
                      <ion-icon name="time-outline" color="medium"></ion-icon>
                      <span>{{ formatDate(record.exchangeDate) }}</span>
                    </div>
                    
                    <div class="points-used">
                      <ion-icon name="diamond" color="warning"></ion-icon>
                      <span>{{ record.pointsUsed }} 點數</span>
                    </div>
                  </div>

                  <!-- 狀態標籤 -->
                  <ion-chip
                    :color="getStatusColor(record.status)"
                    :class="`status-${record.status}`"
                  >
                    <ion-icon :name="getStatusIcon(record.status)"></ion-icon>
                    <ion-label>{{ getStatusText(record.status) }}</ion-label>
                  </ion-chip>
                </div>
              </div>
            </ion-card-content>
          </ion-card>

          <!-- 統計資訊 -->
          <ion-card class="summary-card">
            <ion-card-header>
              <ion-card-title>兌換統計</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-value">{{ exchangeRecords.length }}</div>
                  <div class="summary-label">總兌換次數</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{ totalPointsUsed }}</div>
                  <div class="summary-label">累計使用點數</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{ completedExchanges }}</div>
                  <div class="summary-label">成功兌換</div>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- 無兌換記錄 -->
        <div v-else class="empty-state">
          <ion-icon name="receipt-outline" size="large" color="medium"></ion-icon>
          <h3>暫無兌換記錄</h3>
          <p>您還沒有進行任何兌換</p>
          <ion-button @click="goToProducts" fill="outline">
            前往兌換商品
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonChip,
  IonLabel,
  IonButton,
  IonSpinner,
  toastController
} from '@ionic/vue'
import {
  timeOutline,
  diamond,
  receiptOutline,
  checkmarkCircle,
  time,
  closeCircle
} from 'ionicons/icons'
import authService from '@/services/auth'
import productService from '@/services/product'
import type { Member, ExchangeRecord } from '@/types'

const router = useRouter()

const member = ref<Member | null>(null)
const exchangeRecords = ref<ExchangeRecord[]>([])
const loading = ref(true)

const totalPointsUsed = computed(() => {
  return exchangeRecords.value.reduce((total, record) => total + record.pointsUsed, 0)
})

const completedExchanges = computed(() => {
  return exchangeRecords.value.filter(record => record.status === 'completed').length
})

onMounted(async () => {
  member.value = authService.getCurrentMember()
  
  if (!member.value) {
    router.push('/login')
    return
  }

  await loadExchangeHistory()
})

const loadExchangeHistory = async () => {
  try {
    loading.value = true
    const response = await productService.getExchangeHistory()
    
    if (response.success && response.data) {
      exchangeRecords.value = response.data
    } else {
      const toast = await toastController.create({
        message: response.message || '載入兌換記錄失敗',
        duration: 3000,
        color: 'danger'
      })
      await toast.present()
    }
  } catch (error) {
    console.error('Failed to load exchange history:', error)
    const toast = await toastController.create({
      message: '載入兌換記錄時發生錯誤',
      duration: 3000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天 ' + date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffDays === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'pending':
      return '處理中'
    case 'cancelled':
      return '已取消'
    default:
      return '未知'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'medium'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return checkmarkCircle
    case 'pending':
      return time
    case 'cancelled':
      return closeCircle
    default:
      return time
  }
}

const goToProducts = () => {
  router.push('/products')
}
</script>

<style scoped>
.history-container {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.loading-container,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-container p,
.empty-state p {
  margin-top: 1rem;
  color: var(--ion-color-medium);
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: var(--ion-color-medium);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.record-card {
  margin: 0;
}

.record-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.product-image-container {
  flex-shrink: 0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.record-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.record-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.exchange-date,
.points-used {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.points-used {
  color: var(--ion-color-warning);
  font-weight: 600;
}

.summary-card {
  margin-top: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.summary-item {
  padding: 0.5rem;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--ion-color-primary);
  margin-bottom: 0.25rem;
}

.summary-label {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  font-weight: 600;
}

@media (max-width: 768px) {
  .history-container {
    padding: 0.5rem;
  }
  
  .record-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .product-image {
    width: 120px;
    height: 120px;
  }
  
  .record-meta {
    align-items: center;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
