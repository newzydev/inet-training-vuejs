import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

// meta.guest = เฉพาะคนที่ยังไม่ login / meta.admin = เฉพาะ admin / อื่นๆ = ต้อง login
const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
  { path: '/', name: 'shop', component: () => import('@/views/ShopView.vue') },
  { path: '/product/:id', name: 'product', component: () => import('@/views/ProductView.vue') },
  { path: '/cart', name: 'cart', component: () => import('@/views/CartView.vue') },
  { path: '/orders', name: 'orders', component: () => import('@/views/OrdersView.vue') },
  { path: '/manage', name: 'manage', component: () => import('@/views/ManageView.vue'), meta: { admin: true } },
  { path: '*', redirect: '/' }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior: () => ({ x: 0, y: 0 }) // เปลี่ยนหน้าแล้วเลื่อนขึ้นบนสุด
})

// ด่านตรวจสิทธิ์ก่อนเข้าทุกหน้า
router.beforeEach((to, from, next) => {
  const loggedIn = store.getters['auth/isLoggedIn']
  const isAdmin = store.getters['auth/isAdmin']

  if (to.meta.guest) return loggedIn ? next('/') : next() // login แล้วไม่ต้องเข้าหน้า login
  if (!loggedIn) return next({ name: 'login', query: { redirect: to.fullPath } }) // ยังไม่ login -> ไปหน้า login
  if (to.meta.admin && !isAdmin) return next('/') // หน้า admin แต่ไม่ใช่ admin
  next()
})

export default router
