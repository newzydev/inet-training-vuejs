// Store ตะกร้าสินค้า: backend ไม่มี API ตะกร้า จึงเก็บไว้ฝั่งเบราว์เซอร์ (localStorage)
// แต่ละรายการเก็บ "ภาพถ่าย" ของสินค้าไว้ด้วย (ชื่อ ราคา รูป สต็อก) เพื่อแสดงผลได้ทันที
const KEY = 'shop_cart'

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch (e) { return [] }
}

// จำนวนต้องเป็นจำนวนเต็ม อยู่ระหว่าง 1 ถึงสต็อกที่มี
const clamp = (qty, stock) => Math.max(1, Math.min(Math.floor(qty) || 1, stock))

export default {
  namespaced: true,
  state: () => ({
    items: load() // [{ id, name, price, image, stock, qty }]
  }),
  getters: {
    count: (state) => state.items.reduce((sum, i) => sum + i.qty, 0), // จำนวนชิ้นรวม (โชว์บนไอคอนตะกร้า)
    total: (state) => state.items.reduce((sum, i) => sum + i.price * i.qty, 0), // ราคารวม
    // จำนวนของสินค้านี้ที่อยู่ในตะกร้าแล้ว (ใช้คำนวณว่าเพิ่มได้อีกเท่าไร)
    qtyOf: (state) => (id) => {
      const item = state.items.find(i => i.id === id)
      return item ? item.qty : 0
    }
  },
  mutations: {
    // เพิ่มสินค้า: ถ้ามีอยู่แล้วให้บวกจำนวน แต่ไม่เกินสต็อก
    add (state, { product, qty = 1 }) {
      const item = state.items.find(i => i.id === product._id)
      if (item) {
        item.stock = product.stock
        item.qty = clamp(item.qty + qty, product.stock)
      } else {
        state.items.push({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock,
          qty: clamp(qty, product.stock)
        })
      }
    },
    setQty (state, { id, qty }) {
      const item = state.items.find(i => i.id === id)
      if (item) item.qty = clamp(qty, item.stock)
    },
    remove (state, id) {
      state.items = state.items.filter(i => i.id !== id)
    },
    clear (state) {
      state.items = []
    },
    // อัปเดตข้อมูลในตะกร้าให้ตรงกับสินค้าจริงจาก backend (ราคา/สต็อกอาจเปลี่ยน, สินค้าอาจถูกลบ)
    sync (state, products) {
      state.items = state.items
        .map(item => {
          const p = products.find(x => x._id === item.id)
          if (!p || p.stock < 1) return null // สินค้าหายไปหรือหมด -> เอาออกจากตะกร้า
          return { ...item, name: p.name, price: p.price, image: p.image, stock: p.stock, qty: clamp(item.qty, p.stock) }
        })
        .filter(Boolean)
    }
  }
}
