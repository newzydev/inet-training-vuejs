// ตัวเรียก API กลาง: ตั้ง base URL, แนบ token ให้ทุก request และแปลง error เป็นข้อความภาษาไทย
import axios from 'axios'
import store from '@/store'
import router from '@/router'

// ที่อยู่ backend (ตั้งผ่าน VUE_APP_API_URL ในไฟล์ .env ได้)
export const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3000'

// แปลงข้อความ error ของ backend (ภาษาอังกฤษ) เป็นภาษาไทย
const THAI = {
  'invalid email or password': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'waiting for approval': 'บัญชีนี้ยังรอผู้ดูแลระบบอนุมัติ',
  'email already exists': 'อีเมลนี้ถูกใช้สมัครไปแล้ว',
  'name, email, password are required': 'กรุณากรอกชื่อ อีเมล และรหัสผ่านให้ครบ',
  'email and password are required': 'กรุณากรอกอีเมลและรหัสผ่าน',
  'cannot add order: quantity exceeds stock': 'จำนวนที่สั่งเกินสต็อกที่เหลือ',
  'product not found': 'ไม่พบสินค้านี้ (อาจถูกลบไปแล้ว)',
  'name and price are required': 'กรุณากรอกชื่อและราคาสินค้า'
}

const api = axios.create({ baseURL: API_URL + '/api/v1' })

// ก่อนส่งทุก request: แนบ token (ถ้ามี) ใน header Authorization
api.interceptors.request.use((config) => {
  const token = store.state.auth.token
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

// หลังได้ response: ดึงเฉพาะ data ออกมาให้ (backend ตอบเป็น { status, message, data })
api.interceptors.response.use(
  (res) => res.data.data,
  (err) => {
    const res = err.response
    const message = res ? res.data && res.data.message : null

    // token หมดอายุหรือไม่ถูกต้อง -> ออกจากระบบแล้วกลับไปหน้า login
    if (res && res.status === 401 && store.state.auth.token) {
      store.dispatch('auth/logout')
      router.push({ name: 'login' }).catch(() => {})
    }

    const text = !res
      ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่า Back-end รันอยู่ที่ ' + API_URL
      : THAI[message] || message || 'เกิดข้อผิดพลาด'
    return Promise.reject(new Error(text))
  }
)

// path รูปจาก backend (เช่น /uploads/products/a.png) -> URL เต็ม
export const imageUrl = (path) => (path ? API_URL + path : '')

export default api
