<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>商品兌換</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="products-container">
        <!-- 會員點數顯示 -->
        <ion-card class="points-summary">
          <ion-card-content>
            <div class="points-info">
              <ion-icon name="diamond" color="warning"></ion-icon>
              <span>目前點數：{{ member?.points || 0 }}</span>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- 載入中 -->
        <div v-if="loading" class="loading-container">
          <ion-spinner></ion-spinner>
          <p>載入商品中...</p>
        </div>

        <!-- 商品列表 -->
        <div v-else-if="products.length > 0" class="products-grid">
          <ion-card
            v-for="product in products"
            :key="product.id"
            class="product-card"
            button
            @click="goToExchange(product.id)"
          >
            <img :src="product.image" :alt="product.name" class="product-image" />
            
            <ion-card-header>
              <ion-card-title>{{ product.name }}</ion-card-title>
              <ion-card-subtitle>{{ product.category }}</ion-card-subtitle>
            </ion-card-header>
            
            <ion-card-content>
              <p class="product-description">{{ product.description }}</p>
              
              <div class="product-footer">
                <div class="points-required">
                  <ion-icon name="diamond" color="warning"></ion-icon>
                  <span>{{ product.requiredPoints }}</span>
                </div>
                
                <ion-chip
                  :color="canAfford(product) ? 'success' : 'danger'"
                  :outline="!canAfford(product)"
                >
                  {{ canAfford(product) ? '可兌換' : '點數不足' }}
                </ion-chip>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- 無商品 -->
        <div v-else class="empty-state">
          <ion-icon name="storefront-outline" size="large" color="medium"></ion-icon>
          <h3>目前沒有可兌換的商品</h3>
          <p>請稍後再來查看</p>
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
  IonButtons,
  IonBackButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonChip,
  IonSpinner,
  toastController
} from '@ionic/vue'
import {
  diamond,
  storefrontOutline
} from 'ionicons/icons'
import authService from '@/services/auth'
import productService from '@/services/product'
import type { Member, Product } from '@/types'

const router = useRouter()

const member = ref<Member | null>(null)
const products = ref<Product[]>([])
const loading = ref(true)

onMounted(async () => {
  member.value = authService.getCurrentMember()
  
  if (!member.value) {
    router.push('/login')
    return
  }

  await loadProducts()
})

const loadProducts = async () => {
  try {
    loading.value = true
    const response = await productService.getProducts()
    
    if (response.success && response.data) {
      products.value = response.data
    } else {
      const toast = await toastController.create({
        message: response.message || '載入商品失敗',
        duration: 3000,
        color: 'danger'
      })
      await toast.present()
    }
  } catch (error) {
    console.error('Failed to load products:', error)
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

const canAfford = (product: Product): boolean => {
  return (member.value?.points || 0) >= product.requiredPoints
}

const goToExchange = (productId: string) => {
  router.push(`/exchange/${productId}`)
}
</script>

<style scoped>
.products-container {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.points-summary {
  margin-bottom: 1rem;
}

.points-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--ion-color-warning);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-container p {
  margin-top: 1rem;
  color: var(--ion-color-medium);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.product-card {
  margin: 0;
  overflow: hidden;
  transition: transform 0.2s ease;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-description {
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-required {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--ion-color-warning);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: var(--ion-color-medium);
}

.empty-state p {
  color: var(--ion-color-medium);
  margin: 0;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .products-container {
    padding: 0.5rem;
  }
}
</style>
