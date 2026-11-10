// ตัวเรียก API กลาง: ตั้ง base URL, แนบ token ให้ทุก request และแปลง error เป็นข้อความภาษาไทย
import axios from 'axios'
import store from './store'
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
  'name and price are required': 'กรุณากรอกชื่อและราคาสินค้า',
  'name cannot be empty': 'กรุณากรอกชื่อ',
  'name or newPassword is required': 'ไม่มีข้อมูลที่จะแก้ไข',
  'newPassword must be at least 4 characters': 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 4 ตัวอักษร',
  'current password is incorrect': 'รหัสผ่านเดิมไม่ถูกต้อง',
  'user not found': 'ไม่พบผู้ใช้นี้ (อาจถูกลบไปแล้ว)',
  'you cannot revoke yourself': 'ระงับสิทธิ์ตัวเองไม่ได้',
  'cannot revoke an admin': 'ระงับสิทธิ์ผู้ดูแลระบบไม่ได้',
  'you cannot change your own role': 'เปลี่ยนบทบาทของตัวเองไม่ได้',
  'you cannot delete yourself': 'ลบตัวเองไม่ได้',
  'user has orders, revoke access instead': 'ผู้ใช้นี้เคยสั่งซื้อแล้ว ลบไม่ได้ ให้ใช้ "ระงับสิทธิ์" แทน',
  'order not found': 'ไม่พบออเดอร์นี้',
  'not your order': 'นี่ไม่ใช่ออเดอร์ของคุณ',
  'order status has changed, please try again': 'สถานะออเดอร์เพิ่งถูกเปลี่ยน กรุณาลองใหม่อีกครั้ง'
}

// ข้อความ error ที่ backend เติมค่าต่อท้าย (เช่น "cannot cancel an order that is shipped") จับคู่จากส่วนต้นของข้อความ
const THAI_PREFIX = [
  ['cannot cancel an order that is', 'ยกเลิกไม่ได้ เพราะออเดอร์นี้จัดส่งหรือยกเลิกไปแล้ว'],
  ['cannot change status from', 'เปลี่ยนสถานะข้ามลำดับไม่ได้ (รอยืนยัน → ยืนยันแล้ว → จัดส่งแล้ว)']
]
const toThai = (message) => {
  if (THAI[message]) return THAI[message]
  const hit = THAI_PREFIX.find(([prefix]) => message && message.startsWith(prefix))
  return hit ? hit[1] : message
}

// ข้อความ 401 ที่แปลว่า "token ใช้ไม่ได้แล้ว" (ต่างจาก 401 แบบ "ไม่มีสิทธิ์ทำสิ่งนี้" เช่น admin only)
const TOKEN_ERRORS = ['token required', 'invalid or expired token', 'user not found or not approved']

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

    // token หมดอายุ/ไม่ถูกต้อง/ผู้ใช้ถูกระงับ -> ออกจากระบบแล้วกลับไปหน้า login
    // (401 แบบอื่น เช่น "admin only" ไม่ต้องออกจากระบบ แค่แจ้ง error)
    if (res && res.status === 401 && store.state.auth.token && TOKEN_ERRORS.includes(message)) {
      store.dispatch('auth/logout')
      router.push({ name: 'shop-login' }).catch(() => {})
    }

    const text = !res
      ? 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบว่า Back-end รันอยู่ที่ ' + API_URL
      : toThai(message) || 'เกิดข้อผิดพลาด'
    return Promise.reject(new Error(text))
  }
)

// path รูปจาก backend (เช่น /uploads/products/a.png) -> URL เต็ม
export const imageUrl = (path) => (path ? API_URL + path : '')

export default api
