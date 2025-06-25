<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>會員中心</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="logout">
            <ion-icon name="log-out-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="dashboard-container ion-padding">
        <!-- 會員資訊卡片 -->
        <ion-card class="points-card">
          <ion-card-header>
            <div class="member-info">
              <ion-avatar>
                <img :src="member?.avatar" alt="會員頭像" />
              </ion-avatar>
              <div class="member-details">
                <ion-card-title>{{ member?.username }}</ion-card-title>
                <ion-card-subtitle>{{ member?.email }}</ion-card-subtitle>
              </div>
            </div>
          </ion-card-header>
          
          <ion-card-content>
            <div class="points-display">
              <h2>目前點數</h2>
              <div class="points-number">
                <ion-icon name="diamond" color="warning"></ion-icon>
                <span>{{ member?.points || 0 }}</span>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- 快捷功能 -->
        <div class="quick-actions">
          <h3>快捷功能</h3>
          
          <div class="action-grid">
            <ion-card button @click="goToProducts" class="action-card">
              <ion-card-content>
                <ion-icon name="storefront" color="primary" size="large"></ion-icon>
                <h4>商品兌換</h4>
                <p>查看可兌換商品</p>
              </ion-card-content>
            </ion-card>

            <ion-card button @click="goToHistory" class="action-card">
              <ion-card-content>
                <ion-icon name="time" color="secondary" size="large"></ion-icon>
                <h4>兌換記錄</h4>
                <p>查看兌換歷史</p>
              </ion-card-content>
            </ion-card>
          </div>
        </div>

        <!-- 最近兌換記錄 -->
        <div class="recent-exchanges" v-if="recentExchanges.length > 0">
          <h3>最近兌換</h3>
          
          <ion-card v-for="record in recentExchanges" :key="record.id">
            <ion-card-content>
              <div class="exchange-item">
                <img :src="record.productImage" :alt="record.productName" class="product-thumb" />
                <div class="exchange-details">
                  <h4>{{ record.productName }}</h4>
                  <p>{{ formatDate(record.exchangeDate) }}</p>
                  <ion-chip :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </ion-chip>
                </div>
                <div class="points-used">
                  <ion-icon name="diamond" color="warning"></ion-icon>
                  <span>{{ record.pointsUsed }}</span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonAvatar,
  IonChip,
  alertController,
  toastController
} from '@ionic/vue'
import {
  logOutOutline,
  diamond,
  storefront,
  time
} from 'ionicons/icons'
import authService from '@/services/auth'
import productService from '@/services/product'
import type { Member, ExchangeRecord } from '@/types'

const router = useRouter()

const member = ref<Member | null>(null)
const recentExchanges = ref<ExchangeRecord[]>([])

onMounted(async () => {
  member.value = authService.getCurrentMember()
  
  if (!member.value) {
    router.push('/login')
    return
  }

  // 載入最近兌換記錄（最多顯示3筆）
  try {
    const response = await productService.getExchangeHistory()
    if (response.success && response.data) {
      recentExchanges.value = response.data.slice(0, 3)
    }
  } catch (error) {
    console.error('Failed to load recent exchanges:', error)
  }
})

const logout = async () => {
  const alert = await alertController.create({
    header: '確認登出',
    message: '您確定要登出嗎？',
    buttons: [
      {
        text: '取消',
        role: 'cancel'
      },
      {
        text: '登出',
        role: 'confirm',
        handler: async () => {
          authService.logout()
          
          const toast = await toastController.create({
            message: '已成功登出',
            duration: 2000,
            color: 'success'
          })
          await toast.present()
          
          router.push('/login')
        }
      }
    ]
  })

  await alert.present()
}

const goToProducts = () => {
  router.push('/products')
}

const goToHistory = () => {
  router.push('/history')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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
</script>

<style scoped>
.dashboard-container {
  max-width: 600px;
  margin: 0 auto;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.member-details h2,
.member-details p {
  margin: 0;
}

.points-display {
  text-align: center;
}

.points-display h2 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.points-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 2.5rem;
  font-weight: bold;
}

.quick-actions h3,
.recent-exchanges h3 {
  margin: 2rem 0 1rem 0;
  color: var(--ion-color-dark);
}

.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.action-card {
  margin: 0;
  text-align: center;
}

.action-card ion-card-content {
  padding: 1.5rem 1rem;
}

.action-card h4 {
  margin: 1rem 0 0.5rem 0;
  color: var(--ion-color-dark);
}

.action-card p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.exchange-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-thumb {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.exchange-details {
  flex: 1;
}

.exchange-details h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.exchange-details p {
  margin: 0 0 0.5rem 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

.points-used {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--ion-color-warning);
  font-weight: bold;
}
</style>
