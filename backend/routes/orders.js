// Order ทั้งหมดในระบบ — ต้อง login และได้รับ Approve
// (การสร้าง Order อยู่ที่ POST /products/:id/orders ในไฟล์ products.js)
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { auth, adminOnly } = require('../middleware/auth');
const r = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.use(auth); // ทุก route ในไฟล์นี้ต้องผ่าน auth

// :id ต้องเป็น ObjectId ที่ถูกต้อง ไม่งั้นตอบ 400 ทันที
router.param('id', (req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : r.badRequest(res, 'invalid id')
);

// แนบข้อมูลสินค้า (ชื่อ/ราคา/รูป) และผู้สั่ง (ชื่อ/อีเมล) เข้าไปกับ Order
const withDetails = (query) => query.populate('product', 'name price image').populate('user', 'name email');

// สถานะที่เปลี่ยนต่อได้จากสถานะปัจจุบัน (shipped และ cancelled คือสถานะสุดท้าย)
const NEXT = { pending: ['confirmed', 'cancelled'], confirmed: ['shipped', 'cancelled'], shipped: [], cancelled: [] };

// ใช่เจ้าของ Order หรือ admin หรือไม่
const canAccess = (order, user) =>
  user.role === 'admin' || (order.user && String(order.user._id || order.user) === String(user._id));

/* เปลี่ยนสถานะ Order แบบ atomic (กันสองคนกดพร้อมกัน) แล้วถ้าเป็นการยกเลิกให้คืน stock
   Order เก่าที่ไม่มี field status ถือเป็น pending จึงต้องจับคู่ค่า null ด้วย */
async function moveStatus(order, nextStatus) {
  const current = order.status === 'pending' ? { $in: ['pending', null] } : order.status;
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: current },
    { status: nextStatus },
    { returnDocument: 'after' }
  );
  if (!updated) return null; // มีคนเปลี่ยนสถานะไปก่อนแล้ว
  if (nextStatus === 'cancelled') {
    await Product.updateOne({ _id: order.product._id || order.product }, { $inc: { stock: order.quantity } }); // คืน stock
  }
  return updated;
}

/* [GET] /api/v1/orders — แสดง Order ทุกรายการ */
router.get('/', asyncHandler(async (req, res) => {
  r.ok(res, await withDetails(Order.find()).sort({ createdAt: -1 }));
}));

/* [GET] /api/v1/orders/me — แสดง Order ของตัวเองเท่านั้น */
router.get('/me', asyncHandler(async (req, res) => {
  r.ok(res, await withDetails(Order.find({ user: req.user._id })).sort({ createdAt: -1 }));
}));

/* [GET] /api/v1/orders/:id — ดู Order 1 รายการ (เจ้าของหรือ admin เท่านั้น) */
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await withDetails(Order.findById(req.params.id));
  if (!order) return r.badRequest(res, 'order not found');
  if (!canAccess(order, req.user)) return r.unauthorized(res, 'not your order');
  r.ok(res, order);
}));

/* [PUT] /api/v1/orders/:id/cancel — ยกเลิก Order (เจ้าของหรือ admin) ได้เฉพาะที่ยังไม่จัดส่ง และคืน stock ให้สินค้า */
router.put('/:id/cancel', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return r.badRequest(res, 'order not found');
  if (!canAccess(order, req.user)) return r.unauthorized(res, 'not your order');
  if (!NEXT[order.status].includes('cancelled')) return r.badRequest(res, `cannot cancel an order that is ${order.status}`);

  if (!(await moveStatus(order, 'cancelled'))) return r.badRequest(res, 'order status has changed, please try again');
  r.ok(res, await withDetails(Order.findById(order._id)), 'cancelled');
}));

/* [PUT] /api/v1/orders/:id/status — admin เปลี่ยนสถานะ Order (pending -> confirmed -> shipped หรือยกเลิก) */
router.put('/:id/status', adminOnly, asyncHandler(async (req, res) => {
  const next = req.body.status;
  if (!Object.keys(NEXT).includes(next)) return r.badRequest(res, `status must be one of: ${Object.keys(NEXT).join(', ')}`);

  const order = await Order.findById(req.params.id);
  if (!order) return r.badRequest(res, 'order not found');
  if (!NEXT[order.status].includes(next)) return r.badRequest(res, `cannot change status from ${order.status} to ${next}`);

  if (!(await moveStatus(order, next))) return r.badRequest(res, 'order status has changed, please try again');
  r.ok(res, await withDetails(Order.findById(order._id)), 'status updated');
}));

module.exports = router;
