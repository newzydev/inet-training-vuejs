// ตัวช่วยจัดรูปแบบข้อความ (ใช้เป็น filter ในเทมเพลต เช่น {{ price | baht }})

// ราคา: 1234.5 -> "฿1,234.50"
export const baht = (value) =>
  '฿' + Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

// วันเวลา: "2026-11-10T02:15:00Z" -> "10 พ.ย. 2569 09:15"
export const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-'
