// Schema ของ Order (collection "orders") — 1 Product มีได้หลาย Order
const mongoose = require('mongoose');

// สถานะของ Order: pending (รอยืนยัน) -> confirmed (ยืนยันแล้ว) -> shipped (จัดส่งแล้ว) / cancelled (ยกเลิก)
const STATUSES = ['pending', 'confirmed', 'shipped', 'cancelled'];

const orderSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ผู้สั่ง
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger }, // จำนวนเต็ม >= 1
    unitPrice: { type: Number, required: true }, // ราคาต่อชิ้น ณ เวลาที่สั่ง
    totalPrice: { type: Number, required: true }, // unitPrice * quantity
    status: { type: String, enum: STATUSES, default: 'pending' }, // Order เก่าที่ไม่มี field นี้จะถือเป็น pending
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
module.exports.STATUSES = STATUSES;
