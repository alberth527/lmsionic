<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>會員登入</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <div class="logo-section">
          <ion-icon name="card" size="large" color="primary"></ion-icon>
          <h1>紅利兌換系統</h1>
          <p>登入您的會員帳戶</p>
        </div>

        <ion-card>
          <ion-card-content>
            <form @submit.prevent="handleLogin">
              <ion-item>
                <ion-label position="stacked">帳號</ion-label>
                <ion-input
                  v-model="loginForm.username"
                  type="text"
                  placeholder="請輸入帳號"
                  required
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="stacked">密碼</ion-label>
                <ion-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="請輸入密碼"
                  required
                ></ion-input>
              </ion-item>

              <ion-button
                expand="block"
                type="submit"
                :disabled="loading"
                class="ion-margin-top"
              >
                <ion-spinner v-if="loading" name="crescent"></ion-spinner>
                <span v-else>登入</span>
              </ion-button>
            </form>

            <div class="demo-info ion-margin-top">
              <ion-text color="medium">
                <p><strong>測試帳號：</strong></p>
                <p>帳號：demo</p>
                <p>密碼：123456</p>
              </ion-text>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  toastController
} from '@ionic/vue'
import { card } from 'ionicons/icons'
import authService from '@/services/auth'
import type { LoginForm } from '@/types'

const router = useRouter()

const loginForm = ref<LoginForm>({
  username: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  
  try {
    const response = await authService.login(loginForm.value)
    
    if (response.success) {
      const toast = await toastController.create({
        message: response.message || '登入成功',
        duration: 2000,
        color: 'success'
      })
      await toast.present()
      
      router.push('/dashboard')
    } else {
      const toast = await toastController.create({
        message: response.message || '登入失敗',
        duration: 3000,
        color: 'danger'
      })
      await toast.present()
    }
  } catch (error) {
    console.error('Login error:', error)
    const toast = await toastController.create({
      message: '登入時發生錯誤，請稍後再試',
      duration: 3000,
      color: 'danger'
    })
    await toast.present()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-section h1 {
  margin: 1rem 0 0.5rem 0;
  color: var(--ion-color-primary);
}

.logo-section p {
  color: var(--ion-color-medium);
  margin-bottom: 0;
}

.demo-info {
  text-align: center;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.demo-info p {
  margin: 0.25rem 0;
}
</style>
