import Vue from 'vue'
import VueRouter from 'vue-router'
import { routes as shopRoutes, guard as shopGuard } from '@/workshops/workshop_3_shopping_cart/routes'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/workshop-1' },
  {
    path: '/workshop-1',
    name: 'workshop-1',
    component: () => import('@/workshops/workshop_1_profile_card/ProfileView.vue'),
    meta: { title: 'นิว.dev' }
  },
  {
    path: '/workshop-2',
    name: 'workshop-2',
    component: () => import('@/workshops/workshop_2_grade_calculator/GradeView.vue'),
    meta: { title: 'นิว.grade' }
  },
  ...shopRoutes, // Workshop 3 (ทุกหน้าอยู่ใต้ /workshop-3)
  { path: '*', redirect: '/workshop-1' }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  // ลิงก์ #หัวข้อ (เช่น #about ใน Workshop 1) -> เลื่อนไปหัวข้อนั้น (ต้องเช็คก่อน saved เพราะ router นับการกดลิงก์ # เป็น "ย้อนกลับ")
  // กดย้อนกลับ/เดินหน้า -> กลับไปตำแหน่งเดิม, เปลี่ยนหน้าใหม่ -> เลื่อนขึ้นบนสุด
  scrollBehavior: (to, from, saved) => (to.hash ? { selector: to.hash, offset: { x: 0, y: 68 } } : saved || { x: 0, y: 0 })
})

router.beforeEach(shopGuard) // ตรวจสิทธิ์ (มีผลเฉพาะหน้าของ Workshop 3 ที่ตั้ง meta ไว้)

// ตั้งชื่อแท็บเบราว์เซอร์ตาม Workshop ที่เปิดอยู่
router.afterEach((to) => {
  const title = to.matched[0] && to.matched[0].meta.title
  document.title = title || 'นิว | Vue.js Workshops'
})

export default router
