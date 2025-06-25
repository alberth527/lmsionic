export const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'ProductList',
    component: () => import('@/views/ProductList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exchange/:id',
    name: 'ExchangeConfirm',
    component: () => import('@/views/ExchangeConfirm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'ExchangeHistory',
    component: () => import('@/views/ExchangeHistory.vue'),
    meta: { requiresAuth: true }
  }
]
