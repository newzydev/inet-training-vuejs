// ข้อมูลสถานะของ Order (ใช้แสดงป้ายสี ไอคอน และลำดับขั้น)
// step = ลำดับขั้นของ Order ที่ปกติ (0 รอยืนยัน, 1 ยืนยันแล้ว, 2 จัดส่งแล้ว) ส่วน -1 = ยกเลิก
export const ORDER_STATUS = {
  pending: { value: 'pending', text: 'รอยืนยัน', color: 'warning', icon: 'mdi-clock-outline', step: 0 },
  confirmed: { value: 'confirmed', text: 'ยืนยันแล้ว', color: 'info', icon: 'mdi-check-circle-outline', step: 1 },
  shipped: { value: 'shipped', text: 'จัดส่งแล้ว', color: 'success', icon: 'mdi-truck-delivery-outline', step: 2 },
  cancelled: { value: 'cancelled', text: 'ยกเลิก', color: 'error', icon: 'mdi-close-circle-outline', step: -1 }
}

// Order เก่าอาจไม่มีสถานะ -> ถือเป็น "รอยืนยัน" (เหมือนที่ backend ทำ)
export const statusOf = (status) => ORDER_STATUS[status] || ORDER_STATUS.pending

// สถานะที่เปลี่ยนต่อได้ (ตรงกับกติกาของ backend)
export const NEXT_STATUS = { pending: ['confirmed', 'cancelled'], confirmed: ['shipped', 'cancelled'], shipped: [], cancelled: [] }

// ยกเลิกได้ไหม (ยังไม่จัดส่งและยังไม่ยกเลิก)
export const canCancel = (status) => NEXT_STATUS[statusOf(status).value].includes('cancelled')
