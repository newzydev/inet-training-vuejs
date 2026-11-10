// จัดการผู้ใช้ — โปรไฟล์ของตัวเอง และการจัดการผู้ใช้โดย admin
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const Order = require('../models/order.model');
const { auth, adminOnly } = require('../middleware/auth');
const r = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { imageUpload, removeFile } = require('../utils/upload');

const router = express.Router();

// :id ต้องเป็น ObjectId ที่ถูกต้อง ไม่งั้นตอบ 400 ทันที
router.param('id', (req, res, next, id) =>
  mongoose.isValidObjectId(id) ? next() : r.badRequest(res, 'invalid id')
);

// ข้อมูลผู้ใช้ที่ส่งกลับได้ (ไม่มี password)
const publicUser = (u) => ({
  _id: u._id, name: u.name, email: u.email, avatar: u.avatar, role: u.role, approved: u.approved, createdAt: u.createdAt,
});

// ผู้ใช้ปลายทางคือตัวเองหรือไม่ (ใช้กัน admin ทำกับตัวเองจนเข้าระบบไม่ได้)
const isSelf = (req) => String(req.params.id) === String(req.user._id);

/* [GET] /api/v1/users — admin ดูรายชื่อผู้ใช้ทั้งหมด (ใช้ในหน้าอนุมัติผู้ใช้)
   เรียงให้ผู้ที่รออนุมัติ (approved = false) ขึ้นก่อน แล้วเรียงตามวันที่สมัครล่าสุด; ไม่ส่ง password กลับ */
router.get('/', auth, adminOnly, asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('name email avatar role approved createdAt')
    .sort({ approved: 1, createdAt: -1 });
  r.ok(res, users); // ไม่มีข้อมูล = [] (200)
}));

/* [GET] /api/v1/users/me — ดูข้อมูลของตัวเอง */
router.get('/me', auth, (req, res) => r.ok(res, publicUser(req.user)));

/* [PUT] /api/v1/users/me — แก้ชื่อ และ/หรือเปลี่ยนรหัสผ่านของตัวเอง
   เปลี่ยนรหัสผ่านต้องส่ง currentPassword (รหัสเดิม) มาด้วย */
router.put('/me', auth, asyncHandler(async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  if (name === undefined && newPassword === undefined) return r.badRequest(res, 'name or newPassword is required');

  const user = await User.findById(req.user._id).select('+password'); // password ถูกซ่อนโดย default
  if (name !== undefined) {
    const trimmed = String(name).trim();
    if (!trimmed) return r.badRequest(res, 'name cannot be empty');
    user.name = trimmed;
  }
  if (newPassword !== undefined) {
    if (String(newPassword).length < 4) return r.badRequest(res, 'newPassword must be at least 4 characters');
    // ใช้ 400 (ไม่ใช่ 401) เพื่อไม่ให้เว็บเข้าใจว่า token หมดอายุแล้วออกจากระบบ
    if (!currentPassword || !(await bcrypt.compare(String(currentPassword), user.password))) {
      return r.badRequest(res, 'current password is incorrect');
    }
    user.password = await bcrypt.hash(String(newPassword), 10);
  }
  await user.save();
  r.ok(res, publicUser(user), 'profile updated');
}));

/* [PUT] /api/v1/users/me/avatar — เปลี่ยนภาพโปรไฟล์ของตัวเอง (form-data, field "avatar") */
router.put('/me/avatar', auth, imageUpload('avatars', 'avatar'), asyncHandler(async (req, res) => {
  if (!req.file) return r.badRequest(res, 'avatar file is required');

  const oldAvatar = req.user.avatar;
  req.user.avatar = req.file.urlPath;
  await req.user.save();
  removeFile(oldAvatar); // ลบภาพเดิมทิ้ง ไม่ให้ไฟล์ค้าง

  r.ok(res, { _id: req.user._id, name: req.user.name, avatar: req.user.avatar }, 'avatar updated');
}));

/* [GET] /api/v1/users/:id — admin ดูผู้ใช้ 1 คน */
router.get('/:id', auth, adminOnly, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return r.badRequest(res, 'user not found');
  r.ok(res, publicUser(user));
}));

/* [PUT] /api/v1/users/:id/approve — admin อนุมัติผู้ใช้ที่รอ Approve */
router.put('/:id/approve', auth, adminOnly, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { returnDocument: 'after' });
  if (!user) return r.badRequest(res, 'user not found');

  r.ok(res, publicUser(user), 'approved');
}));

/* [PUT] /api/v1/users/:id/revoke — admin ระงับสิทธิ์ผู้ใช้ (กลับไปเป็น "รออนุมัติ" เข้าระบบไม่ได้จนกว่าจะอนุมัติใหม่)
   ห้ามระงับตัวเองและห้ามระงับ admin คนอื่น */
router.put('/:id/revoke', auth, adminOnly, asyncHandler(async (req, res) => {
  if (isSelf(req)) return r.badRequest(res, 'you cannot revoke yourself');

  const target = await User.findById(req.params.id);
  if (!target) return r.badRequest(res, 'user not found');
  if (target.role === 'admin') return r.badRequest(res, 'cannot revoke an admin');

  target.approved = false;
  await target.save();
  r.ok(res, publicUser(target), 'revoked');
}));

/* [PUT] /api/v1/users/:id/role — admin เปลี่ยนบทบาท (admin / user) ห้ามเปลี่ยนบทบาทตัวเอง */
router.put('/:id/role', auth, adminOnly, asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'user'].includes(role)) return r.badRequest(res, 'role must be "admin" or "user"');
  if (isSelf(req)) return r.badRequest(res, 'you cannot change your own role');

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: 'after' });
  if (!user) return r.badRequest(res, 'user not found');
  r.ok(res, publicUser(user), 'role updated');
}));

/* [DELETE] /api/v1/users/:id — admin ลบผู้ใช้ (ใช้ปฏิเสธผู้สมัคร)
   ห้ามลบตัวเอง และห้ามลบผู้ใช้ที่เคยสั่งซื้อแล้ว (ประวัติ Order จะขาด) ให้ใช้ระงับสิทธิ์แทน */
router.delete('/:id', auth, adminOnly, asyncHandler(async (req, res) => {
  if (isSelf(req)) return r.badRequest(res, 'you cannot delete yourself');

  const target = await User.findById(req.params.id);
  if (!target) return r.badRequest(res, 'user not found');
  if (await Order.exists({ user: target._id })) return r.badRequest(res, 'user has orders, revoke access instead');

  await target.deleteOne();
  removeFile(target.avatar); // ลบไฟล์ภาพโปรไฟล์ด้วย
  r.ok(res, publicUser(target), 'deleted');
}));

module.exports = router;
