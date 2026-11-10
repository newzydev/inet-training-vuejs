// เส้นทางของ Workshop 3 (ทุกหน้าอยู่ใต้ /workshop-3)
// ShopLayout = โครงหน้า (แถบเมนู + แจ้งเตือน) ส่วน children คือหน้าต่าง ๆ ที่แสดงแทน <router-view />
import ShopLayout from './ShopLayout.vue'
import store from './store'

// meta.guest = เฉพาะคนที่ยังไม่ login / meta.auth = ต้อง login / meta.admin = ต้องเป็น admin
export const routes = [
  {
    path: '/workshop-3',
    component: ShopLayout,
    meta: { title: 'นิว.shop' },
    children: [
      { path: 'login', name: 'shop-login', component: () => import('./views/LoginView.vue'), meta: { guest: true } },
      { path: '', name: 'shop-home', component: () => import('./views/ShopView.vue'), meta: { auth: true } },
      { path: 'product/:id', name: 'shop-product', component: () => import('./views/ProductView.vue'), meta: { auth: true } },
      { path: 'cart', name: 'shop-cart', component: () => import('./views/CartView.vue'), meta: { auth: true } },
      { path: 'orders', name: 'shop-orders', component: () => import('./views/OrdersView.vue'), meta: { auth: true } },
      { path: 'manage', name: 'shop-manage', component: () => import('./views/ManageView.vue'), meta: { auth: true, admin: true } },
      { path: '*', redirect: '/workshop-3' }
    ]
  }
]

// ด่านตรวจสิทธิ์ก่อนเข้าหน้า (ใช้กับเฉพาะหน้าที่มี meta ข้างบน หน้าอื่นผ่านได้เลย)
export const guard = (to, from, next) => {
  const loggedIn = store.getters['auth/isLoggedIn']
  const isAdmin = store.getters['auth/isAdmin']

  if (to.meta.guest) return loggedIn ? next('/workshop-3') : next() // login แล้วไม่ต้องเข้าหน้า login
  if (to.meta.auth) {
    if (!loggedIn) return next({ name: 'shop-login', query: { redirect: to.fullPath } }) // ยังไม่ login -> ไปหน้า login
    if (to.meta.admin && !isAdmin) return next('/workshop-3') // หน้า admin แต่ไม่ใช่ admin
  }
  next()
}
