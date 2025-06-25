<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/products"></ion-back-button>
        </ion-buttons>
        <ion-title>商品兌換</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="exchange-container">
        <!-- 載入中 -->
        <div v-if="loading" class="loading-container">
          <ion-spinner></ion-spinner>
          <p>載入商品資料中...</p>
        </div>

        <!-- 商品詳情 -->
        <div v-else-if="product" class="product-detail">
          <!-- 商品圖片 -->
          <div class="product-image-container">
            <img :src="product.image" :alt="product.name" class="product-image" />
          </div>

          <!-- 商品資訊 -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>{{ product.name }}</ion-card-title>
              <ion-card-subtitle>{{ product.category }}</ion-card-subtitle>
            </ion-card-header>
            
            <ion-card-content>
              <p class="product-description">{{ product.description }}</p>
              
              <div class="points-info">
                <div class="required-points">
                  <h3>所需點數</h3>
                  <div class="points-display">
                    <ion-icon name="diamond" color="warning"></ion-icon>
                    <span>{{ product.requiredPoints }}</span>
                  </div>
                </div>
                
                <div class="current-points">
                  <h3>目前點數</h3>
                  <div class="points-display">
                    <ion-icon name="diamond" color="primary"></ion-icon>
                    <span>{{ member?.points || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- 兌換後剩餘點數 -->
              <div class="remaining-points">
                <h4>兌換後剩餘點數</h4>
                <div class="points-display">
                  <ion-icon 
                    name="diamond" 
                    :color="canAfford ? 'success' : 'danger'"
                  ></ion-icon>
                  <span :class="{ 'negative': !canAfford }">
                    {{ remainingPoints }}
                  </span>
                </div>
              </div>

              <!-- 兌換狀態提示 -->
              <ion-chip
                :color="canAfford ? 'success' : 'danger'"
                :outline="!canAfford"
                class="status-chip"
              >
                <ion-icon 
                  :name="canAfford ? 'checkmark-circle' : 'close-circle'"
                ></ion-icon>
                <ion-label>{{ canAfford ? '可以兌換' : '點數不足' }}</ion-label>
              </ion-chip>
            </ion-card-content>
          </ion-card>

          <!-- 兌換按鈕 -->
          <div class="action-buttons">
            <ion-button
              expand="block"
              size="large"
              :disabled="!canAfford || exchanging"
              @click="confirmExchange"
              color="primary"
            >
              <ion-spinner v-if="exchanging" name="crescent"></ion-spinner>
              <span v-else>
                <ion-icon name="card" slot="start"></ion-icon>
                {{ canAfford ? '確認兌換' : '點數不足' }}
              </span>
            </ion-button>
          </div>
        </div>

        <!-- 商品不存在 -->
        <div v-else class="error-state">
          <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
          <h3>找不到指定商品</h3>
          <p>商品可能已下架或不存在</p>
          <ion-button @click="goBack" fill="outline">
            返回商品列表
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
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
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonSpinner,
  alertController,
  toastController
} from '@ionic/vue'
import {
  diamond,
  checkmarkCircle,
  closeCircle,
  card,
  alertCircleOutline
} from 'ionicons/icons'
import authService from '@/services/auth'
import productService from '@/services/product'
import type { Member, Product } from '@/types'

const router = useRouter()
const route = useRoute()

const member = ref<Member | null>(null)
const product = ref<Product | null>(null)
const loading = ref(true)
const exchanging = ref(false)

const productId = route.params.id as string

const canAfford = computed(() => {
  if (!member.value || !product.value) return false
  return member.value.points >= product.value.requiredPoints
})

const remainingPoints = computed(() => {
  if (!member.value || !product.value) return 0
  return member.value.points - product.value.requiredPoints
})

onMounted(async () => {
  member.value = authService.getCurrentMember()
  
  if (!member.value) {
    router.push('/login')
    return
  }

  await loadProduct()
})

const loadProduct = async () => {
  try {
    loading.value = true
    const response = await productService.getProductById(productId)
    
    if (response.success && response.data) {
      product.value = response.data
    } else {
      const toast = await toastController.create({
        message: response.message || '載入商品失敗',
        duration: 3000,
        color: 'danger'
      })
      await toast.present()
    }
  } catch (error) {
    console.error('Failed to load product:', error)
    const toast = await toastController.create({
      message: '載入商品時發生錯誤',
      duration: 3000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}

const confirmExchange = async () => {
  if (!product.value || !canAfford.value) return

  const alert = await alertController.create({
    header: '確認兌換',
    message: `您確定要使用 ${product.value.requiredPoints} 點數兌換「${product.value.name}」嗎？`,
    buttons: [
      {
        text: '取消',
        role: 'cancel'
      },
      {
        text: '確認兌換',
        role: 'confirm',
        handler: () => {
          executeExchange()
        }
      }
    ]
  })

  await alert.present()
}

const executeExchange = async () => {
  if (!product.value) return

  try {
    exchanging.value = true
    const response = await productService.exchangeProduct(product.value.id)
    
    if (response.success) {
      // 更新本地會員資料
      member.value = authService.getCurrentMember()
      
      const toast = await toastController.create({
        message: response.message || '兌換成功！',
        duration: 3000,
        color: 'success'
      })
      await toast.present()

      // 導向兌換記錄頁面
      router.push('/history')
    } else {
      const toast = await toastController.create({
        message: response.message || '兌換失敗',
        duration: 3000,
        color: 'danger'
      })
      await toast.present()
    }
  } catch (error) {
    console.error('Exchange failed:', error)
    const toast = await toastController.create({
      message: '兌換時發生錯誤，請稍後再試',
      duration: 3000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    exchanging.value = false
  }
}

const goBack = () => {
  router.push('/products')
}
</script>

<style scoped>
.exchange-container {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.loading-container,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-container p,
.error-state p {
  margin-top: 1rem;
  color: var(--ion-color-medium);
}

.error-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: var(--ion-color-danger);
}

.product-image-container {
  margin-bottom: 1rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.product-description {
  color: var(--ion-color-medium);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.points-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.points-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  font-weight: 600;
}

.points-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.remaining-points {
  text-align: center;
  margin-bottom: 1rem;
}

.remaining-points h4 {
  margin: 0 0 0.5rem 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: 600;
}

.remaining-points .points-display {
  justify-content: center;
  font-size: 1.8rem;
}

.negative {
  color: var(--ion-color-danger) !important;
}

.status-chip {
  width: 100%;
  justify-content: center;
  margin: 1rem 0;
}

.action-buttons {
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .exchange-container {
    padding: 0.5rem;
  }
  
  .product-image {
    height: 250px;
  }
  
  .points-info {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}
</style>
