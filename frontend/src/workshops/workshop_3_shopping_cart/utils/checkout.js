// ฟังก์ชันตะกร้าที่ใช้ร่วมกันทั้งหน้าตะกร้าและตะกร้าแบบ drawer
import api from '../api'
import store from '@/store'

// สั่งซื้อสินค้าทั้งหมดในตะกร้า: backend รับ Order ทีละสินค้า จึงวนยิงทีละรายการ
// รายการที่สำเร็จจะถูกเอาออกจากตะกร้า ส่วนที่ไม่สำเร็จ (เช่น สต็อกไม่พอ) จะค้างไว้พร้อมเหตุผล
// คืนค่า { success: จำนวนรายการที่สำเร็จ, failed: [{ name, reason }] }
export async function checkout () {
  const failed = []
  let success = 0
  for (const item of [...store.state.cart.items]) {
    try {
      await api.post('/products/' + item.id + '/orders', { quantity: item.qty })
      store.commit('cart/remove', item.id)
      success++
    } catch (e) {
      failed.push({ name: item.name, reason: e.message })
    }
  }
  return { success, failed }
}

// เทียบตะกร้ากับสินค้าจริงจาก backend (ราคา/สต็อกอาจเปลี่ยน สินค้าอาจหมดหรือถูกลบ)
// คืนค่าชื่อสินค้าที่ถูกนำออกจากตะกร้า เพื่อให้แจ้งผู้ใช้ได้
export async function refreshCart () {
  const before = store.state.cart.items.map(i => i.name)
  try {
    store.commit('cart/sync', await api.get('/products'))
  } catch (e) {
    return [] // โหลดไม่ได้ก็ใช้ข้อมูลที่เก็บไว้ไปก่อน
  }
  const now = store.state.cart.items.map(i => i.name)
  return before.filter(n => !now.includes(n))
}
