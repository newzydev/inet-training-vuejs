// สถิติภาพรวมของร้าน สำหรับหน้า Dashboard ของ admin
const express = require('express');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const { auth, adminOnly } = require('../middleware/auth');
const r = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const LOW_STOCK = 5; // สต็อกที่ถือว่า "เหลือน้อย"
const COUNTED = { $ne: 'cancelled' }; // Order ที่ยกเลิกแล้วไม่นับเป็นยอดขาย

/* [GET] /api/v1/stats — admin ดูสถิติ: ผู้ใช้ สินค้า ออเดอร์ ยอดขาย 7 วัน สินค้าขายดี สินค้าใกล้หมด ออเดอร์ล่าสุด */
router.get('/', auth, adminOnly, asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0); // เริ่มนับจาก 00:00 ของ 6 วันก่อน (รวมวันนี้เป็น 7 วัน)

  const [totalUsers, pendingUsers, admins, totalProducts, outOfStock, lowStock, inventory, byStatus, daily, top, lowStockList, recent] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ approved: false }),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments(),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ stock: { $gt: 0, $lte: LOW_STOCK } }),
      Product.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ['$price', '$stock'] } }, units: { $sum: '$stock' } } }]),
      // จำนวนและยอดเงินของ Order แยกตามสถานะ (Order เก่าที่ไม่มี status นับเป็น pending)
      Order.aggregate([{ $group: { _id: { $ifNull: ['$status', 'pending'] }, count: { $sum: 1 }, amount: { $sum: '$totalPrice' } } }]),
      // ยอดขายรายวัน 7 วันล่าสุด (เวลาไทย)
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, status: COUNTED } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Bangkok' } }, count: { $sum: 1 }, amount: { $sum: '$totalPrice' } } },
      ]),
      // สินค้าขายดี 5 อันดับ (นับจำนวนชิ้น)
      Order.aggregate([
        { $match: { status: COUNTED } },
        { $group: { _id: '$product', quantity: { $sum: '$quantity' }, revenue: { $sum: '$totalPrice' } } },
        { $sort: { quantity: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $project: { _id: 1, quantity: 1, revenue: 1, name: { $arrayElemAt: ['$product.name', 0] }, image: { $arrayElemAt: ['$product.image', 0] } } },
      ]),
      Product.find({ stock: { $lte: LOW_STOCK } }).sort({ stock: 1 }).limit(5).select('name image price stock'),
      Order.find().sort({ createdAt: -1 }).limit(6).populate('product', 'name price image').populate('user', 'name email'),
    ]);

  // แปลงผลรวมตามสถานะเป็น object และรวมยอดขาย (ไม่นับที่ยกเลิก)
  const status = { pending: { count: 0, amount: 0 }, confirmed: { count: 0, amount: 0 }, shipped: { count: 0, amount: 0 }, cancelled: { count: 0, amount: 0 } };
  byStatus.forEach((s) => { status[s._id] = { count: s.count, amount: s.amount }; });
  const counted = ['pending', 'confirmed', 'shipped'];

  // เติมวันที่ไม่มียอดให้เป็น 0 เพื่อให้ได้ครบ 7 วันเสมอ
  const sales7d = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }); // YYYY-MM-DD
    const found = daily.find((x) => x._id === key);
    sales7d.push({ date: key, count: found ? found.count : 0, amount: found ? found.amount : 0 });
  }

  r.ok(res, {
    users: { total: totalUsers, pending: pendingUsers, admins },
    products: { total: totalProducts, outOfStock, lowStock, inventoryValue: (inventory[0] || {}).value || 0, units: (inventory[0] || {}).units || 0 },
    orders: {
      total: counted.concat('cancelled').reduce((s, k) => s + status[k].count, 0),
      revenue: counted.reduce((s, k) => s + status[k].amount, 0),
      byStatus: status,
    },
    sales7d,
    topProducts: top,
    lowStock: lowStockList,
    recentOrders: recent,
  });
}));

module.exports = router;
