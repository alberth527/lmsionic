import { RouteRecordRaw } from 'vue-router'

// 直接靜態導入所有組件，避免懶加載問題
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import ProductList from '../views/ProductList.vue'
import ExchangeConfirm from '../views/ExchangeConfirm.vue'
import ExchangeHistory from '../views/ExchangeHistory.vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard', 
    component: Dashboard
  },
  {
    path: '/products',
    name: 'ProductList',
    component: ProductList
  },
  {
    path: '/exchange/:id',
    name: 'ExchangeConfirm',
    component: ExchangeConfirm,
    props: true
  },
  {
    path: '/history',
    name: 'ExchangeHistory',
    component: ExchangeHistory
  }
]