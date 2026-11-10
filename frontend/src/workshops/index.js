// รายการ Workshop ทั้งหมด: ใช้ทำปุ่มเลือกด้านซ้ายของหน้าจอ
// ถ้าจะเพิ่ม Workshop ใหม่ ให้เพิ่มรายการที่นี่ และเพิ่ม route ใน src/router/index.js
export const workshops = [
  { id: 1, to: '/workshop-1', icon: 'mdi-account-circle-outline', title: 'Profile', brand: 'นิว.dev' },
  { id: 2, to: '/workshop-2', icon: 'mdi-calculator-variant-outline', title: 'Grade', brand: 'นิว.grade' },
  { id: 3, to: '/workshop-3', icon: 'mdi-cart-outline', title: 'Shop', brand: 'นิว.shop' }
]
