// เอกสาร API (OpenAPI 3.0) สำหรับ Swagger UI — เปิดดูที่ /api-docs

// ---------- ส่วนที่ใช้ซ้ำ ----------

// Response ที่ทุก API ตอบกลับ: { status, message, data }
const envelope = (dataSchema, example) => ({
  type: 'object',
  properties: {
    status: { type: 'integer', example: 200 },
    message: { type: 'string', example: 'success' },
    data: dataSchema,
  },
  ...(example && { example }),
});

// ตัวช่วยสร้าง response แต่ละ status
const res = (description, dataSchema = { nullable: true }, example) => ({
  description,
  content: { 'application/json': { schema: envelope(dataSchema, example) } },
});

const R400 = res('ไม่สำเร็จ (ข้อมูลไม่ครบ / ไม่พบรายการ / เกิน Stock)', { nullable: true }, {
  status: 400, message: 'product not found', data: null,
});
const R401 = res('ไม่มีสิทธิ์ (ไม่มี/หมดอายุ token, ยังไม่ Approve, ไม่ใช่ admin)', { nullable: true }, {
  status: 401, message: 'token required', data: null,
});

const secured = [{ bearerAuth: [] }]; // API ที่ต้องมี token
const idParam = (desc) => [{ name: 'id', in: 'path', required: true, description: desc, schema: { type: 'string', example: '6aeaf8d3786b0d25f7cff928' } }];

// body แบบ form-data (มีไฟล์รูป) — field รูปเป็น binary
const form = (schema) => ({ required: true, content: { 'multipart/form-data': { schema } } });
const file = (description) => ({ type: 'string', format: 'binary', description });

const json = (schema) => ({ required: true, content: { 'application/json': { schema } } });

// ---------- Schemas ----------
const schemas = {
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6aeaf8d3786b0d25f7cff927' },
      name: { type: 'string', example: 'Somchai' },
      email: { type: 'string', example: 'somchai@example.com' },
      avatar: { type: 'string', nullable: true, example: '/uploads/avatars/3f2a9c.png', description: 'ภาพโปรไฟล์ (เปิดดูที่ http://localhost:3000 + path นี้)' },
      role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
      approved: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time', description: 'วันที่สมัคร (มีเมื่อดูรายชื่อผู้ใช้ GET /users)' },
    },
  },
  Product: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '6aeaf8d3786b0d25f7cff928' },
      name: { type: 'string', example: 'Pen' },
      description: { type: 'string', example: 'Blue pen' },
      image: { type: 'string', nullable: true, example: '/uploads/products/8b1d7e.png', description: 'ภาพสินค้า' },
      price: { type: 'number', example: 10 },
      stock: { type: 'integer', example: 100 },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  Order: {
    type: 'object',
    properties: {
      _id: { type: 'string' },
      product: { description: 'id สินค้า (หรือข้อมูลสินค้าเมื่อดูทั้งระบบ)', oneOf: [{ type: 'string' }, { $ref: '#/components/schemas/Product' }] },
      user: { description: 'ผู้สั่ง', oneOf: [{ type: 'string' }, { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' } } }] },
      quantity: { type: 'integer', example: 3 },
      unitPrice: { type: 'number', example: 10 },
      totalPrice: { type: 'number', example: 30 },
      status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'cancelled'], example: 'pending', description: 'pending = รอยืนยัน, confirmed = ยืนยันแล้ว, shipped = จัดส่งแล้ว, cancelled = ยกเลิก' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Stats: {
    type: 'object',
    description: 'สถิติภาพรวมของร้าน (สำหรับหน้า Dashboard)',
    properties: {
      users: { type: 'object', properties: { total: { type: 'integer' }, pending: { type: 'integer', description: 'รออนุมัติ' }, admins: { type: 'integer' } } },
      products: { type: 'object', properties: { total: { type: 'integer' }, outOfStock: { type: 'integer' }, lowStock: { type: 'integer', description: 'เหลือ 1-5 ชิ้น' }, inventoryValue: { type: 'number', description: 'มูลค่าสินค้าคงคลัง (ราคา x สต็อก)' }, units: { type: 'integer' } } },
      orders: { type: 'object', properties: { total: { type: 'integer' }, revenue: { type: 'number', description: 'ยอดขายรวม (ไม่นับที่ยกเลิก)' }, byStatus: { type: 'object', description: 'จำนวนและยอดเงินแยกตามสถานะ' } } },
      sales7d: { type: 'array', description: 'ยอดขายรายวัน 7 วันล่าสุด (ครบ 7 วันเสมอ)', items: { type: 'object', properties: { date: { type: 'string', example: '2026-11-10' }, count: { type: 'integer' }, amount: { type: 'number' } } } },
      topProducts: { type: 'array', description: 'สินค้าขายดี 5 อันดับ', items: { type: 'object', properties: { _id: { type: 'string' }, name: { type: 'string' }, image: { type: 'string', nullable: true }, quantity: { type: 'integer' }, revenue: { type: 'number' } } } },
      lowStock: { type: 'array', description: 'สินค้าที่เหลือ 5 ชิ้นหรือน้อยกว่า', items: ref('Product') },
      recentOrders: { type: 'array', description: 'ออเดอร์ล่าสุด 6 รายการ', items: ref('Order') },
    },
  },
};

function ref(name) { return { $ref: `#/components/schemas/${name}` }; }
const list = (name) => ({ type: 'array', items: ref(name) });

// ---------- Spec หลัก ----------
module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'INET Training Node.js API',
    version: '1.0.0',
    description:
      'API จัดการสินค้าและ Order\n\n' +
      '**วิธีใช้:** 1) สมัครสมาชิก `POST /register` → 2) admin อนุมัติ `PUT /users/{id}/approve` → ' +
      '3) `POST /login` เพื่อรับ token → 4) กดปุ่ม **Authorize** ด้านบน แล้ววาง token (ไม่ต้องพิมพ์ Bearer)',
  },
  servers: [{ url: '/api/v1', description: 'Local' }],
  tags: [
    { name: 'Auth', description: 'สมัครสมาชิก / เข้าสู่ระบบ' },
    { name: 'Users', description: 'โปรไฟล์ของตัวเอง + จัดการผู้ใช้ (admin: อนุมัติ / ระงับ / เปลี่ยนบทบาท / ลบ)' },
    { name: 'Products', description: 'จัดการสินค้า' },
    { name: 'Orders', description: 'สั่งซื้อ (ต้องไม่เกิน Stock), ดูของตัวเอง, ยกเลิก (คืน Stock), เปลี่ยนสถานะ (admin)' },
    { name: 'Stats', description: 'สถิติภาพรวมของร้าน (admin)' },
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas,
  },
  paths: {
    '/register': {
      post: {
        tags: ['Auth'],
        summary: 'สมัครสมาชิก (รอ Approve) — แนบภาพโปรไฟล์ได้',
        description: 'ส่งเป็น JSON หรือ multipart/form-data ก็ได้ (ภาพโปรไฟล์ส่งได้เฉพาะแบบ form-data)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Somchai' },
                  email: { type: 'string', example: 'somchai@example.com' },
                  password: { type: 'string', example: '1234' },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Somchai' },
                  email: { type: 'string', example: 'somchai@example.com' },
                  password: { type: 'string', example: '1234' },
                  avatar: file('ภาพโปรไฟล์ (jpg, png, webp, gif) ไม่บังคับ'),
                },
              },
            },
          },
        },
        responses: { 201: res('สร้างสำเร็จ', ref('User')), 400: R400 },
      },
    },
    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'เข้าสู่ระบบ รับ token',
        requestBody: json({
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin@example.com' },
            password: { type: 'string', example: '' },
          },
        }),
        responses: {
          200: res('สำเร็จ', { type: 'object', properties: { token: { type: 'string' }, user: ref('User') } }),
          400: R400,
          401: R401,
        },
      },
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'แสดงรายชื่อผู้ใช้ทั้งหมด (เฉพาะ admin) — ใช้ดูผู้ที่รออนุมัติ',
        description: 'เรียงให้ผู้ที่ **รออนุมัติ** ขึ้นก่อน แล้วเรียงตามวันที่สมัครล่าสุด (ไม่ส่ง password กลับ)',
        security: secured,
        responses: { 200: res('สำเร็จ (ไม่มีข้อมูล = [])', list('User')), 401: R401 },
      },
    },
    '/users/me/avatar': {
      put: {
        tags: ['Users'],
        summary: 'เปลี่ยนภาพโปรไฟล์ของตัวเอง',
        security: secured,
        requestBody: form({ type: 'object', required: ['avatar'], properties: { avatar: file('ภาพโปรไฟล์ (jpg, png, webp, gif)') } }),
        responses: {
          200: res('เปลี่ยนสำเร็จ', { type: 'object', properties: { _id: { type: 'string' }, name: { type: 'string' }, avatar: { type: 'string' } } }),
          400: R400,
          401: R401,
        },
      },
    },
    '/users/{id}/approve': {
      put: {
        tags: ['Users'],
        summary: 'อนุมัติผู้ใช้ (เฉพาะ admin)',
        security: secured,
        parameters: idParam('id ของผู้ใช้'),
        responses: { 200: res('อนุมัติแล้ว', ref('User')), 400: R400, 401: R401 },
      },
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'แสดงรายการ Product ทั้งหมด',
        security: secured,
        responses: { 200: res('สำเร็จ (ไม่มีข้อมูล = [])', list('Product')), 401: R401 },
      },
      post: {
        tags: ['Products'],
        summary: 'เพิ่มรายการ Product — แนบภาพสินค้าได้',
        description: 'ส่งเป็น JSON หรือ multipart/form-data ก็ได้ (ภาพสินค้าส่งได้เฉพาะแบบ form-data)',
        security: secured,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                  name: { type: 'string', example: 'Pen' },
                  description: { type: 'string', example: 'Blue pen' },
                  price: { type: 'number', example: 10 },
                  stock: { type: 'integer', example: 100 },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                  name: { type: 'string', example: 'Pen' },
                  description: { type: 'string', example: 'Blue pen' },
                  price: { type: 'number', example: 10 },
                  stock: { type: 'integer', example: 100 },
                  image: file('ภาพสินค้า (jpg, png, webp, gif) ไม่บังคับ'),
                },
              },
            },
          },
        },
        responses: { 201: res('สร้างสำเร็จ', ref('Product')), 400: R400, 401: R401 },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'ดู Product 1 รายการ',
        security: secured,
        parameters: idParam('id ของสินค้า'),
        responses: { 200: res('สำเร็จ', ref('Product')), 400: R400, 401: R401 },
      },
      put: {
        tags: ['Products'],
        summary: 'แก้ไขรายการ Product (ส่งเฉพาะ field ที่ต้องการแก้) — เปลี่ยนภาพได้',
        description: 'แนบ image ใหม่แบบ form-data เพื่อเปลี่ยนภาพ (ภาพเดิมจะถูกลบ)',
        security: secured,
        parameters: idParam('id ของสินค้า'),
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number', example: 12 },
                  stock: { type: 'integer', example: 80 },
                },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number', example: 12 },
                  stock: { type: 'integer', example: 80 },
                  image: file('ภาพสินค้าใหม่ (jpg, png, webp, gif)'),
                },
              },
            },
          },
        },
        responses: { 200: res('แก้ไขสำเร็จ', ref('Product')), 400: R400, 401: R401 },
      },
      delete: {
        tags: ['Products'],
        summary: 'ลบรายการ Product',
        security: secured,
        parameters: idParam('id ของสินค้า'),
        responses: { 200: res('ลบสำเร็จ', ref('Product')), 400: R400, 401: R401 },
      },
    },
    '/products/{id}/orders': {
      get: {
        tags: ['Orders'],
        summary: 'แสดง Order ทั้งหมดของ Product',
        security: secured,
        parameters: idParam('id ของสินค้า'),
        responses: { 200: res('สำเร็จ (ไม่มีข้อมูล = [])', list('Order')), 400: R400, 401: R401 },
      },
      post: {
        tags: ['Orders'],
        summary: 'เพิ่ม Order ใน Product (ต้องไม่เกิน Stock)',
        security: secured,
        parameters: idParam('id ของสินค้า'),
        requestBody: json({
          type: 'object',
          required: ['quantity'],
          properties: { quantity: { type: 'integer', minimum: 1, example: 3 } },
        }),
        responses: { 201: res('บันทึก Order สำเร็จ (Stock ลดลง)', ref('Order')), 400: R400, 401: R401 },
      },
    },
    '/users/me': {
      get: {
        tags: ['Users'],
        summary: 'ดูข้อมูลของตัวเอง',
        security: secured,
        responses: { 200: res('สำเร็จ', ref('User')), 401: R401 },
      },
      put: {
        tags: ['Users'],
        summary: 'แก้ชื่อ / เปลี่ยนรหัสผ่านของตัวเอง',
        description: 'ส่งอย่างน้อย `name` หรือ `newPassword` — การเปลี่ยนรหัสผ่านต้องส่ง `currentPassword` (รหัสเดิม) มาด้วย',
        security: secured,
        requestBody: json({
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Somchai S.' },
            currentPassword: { type: 'string', example: '1234' },
            newPassword: { type: 'string', minLength: 4, example: '5678' },
          },
        }),
        responses: { 200: res('แก้ไขสำเร็จ', ref('User')), 400: R400, 401: R401 },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'ดูผู้ใช้ 1 คน (เฉพาะ admin)',
        security: secured,
        parameters: idParam('id ของผู้ใช้'),
        responses: { 200: res('สำเร็จ', ref('User')), 400: R400, 401: R401 },
      },
      delete: {
        tags: ['Users'],
        summary: 'ลบผู้ใช้ — ใช้ปฏิเสธผู้สมัคร (เฉพาะ admin)',
        description: 'ห้ามลบตัวเอง และห้ามลบผู้ใช้ที่เคยสั่งซื้อแล้ว (ให้ใช้ระงับสิทธิ์ `revoke` แทน)',
        security: secured,
        parameters: idParam('id ของผู้ใช้'),
        responses: { 200: res('ลบแล้ว', ref('User')), 400: R400, 401: R401 },
      },
    },
    '/users/{id}/revoke': {
      put: {
        tags: ['Users'],
        summary: 'ระงับสิทธิ์ผู้ใช้ (เฉพาะ admin)',
        description: 'ผู้ใช้จะกลับเป็น "รออนุมัติ" และเข้าสู่ระบบไม่ได้จนกว่าจะอนุมัติใหม่ ห้ามระงับตัวเองหรือ admin คนอื่น',
        security: secured,
        parameters: idParam('id ของผู้ใช้'),
        responses: { 200: res('ระงับแล้ว', ref('User')), 400: R400, 401: R401 },
      },
    },
    '/users/{id}/role': {
      put: {
        tags: ['Users'],
        summary: 'เปลี่ยนบทบาทผู้ใช้ (เฉพาะ admin)',
        description: 'ห้ามเปลี่ยนบทบาทของตัวเอง',
        security: secured,
        parameters: idParam('id ของผู้ใช้'),
        requestBody: json({ type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['admin', 'user'], example: 'admin' } } }),
        responses: { 200: res('เปลี่ยนแล้ว', ref('User')), 400: R400, 401: R401 },
      },
    },
    '/orders/me': {
      get: {
        tags: ['Orders'],
        summary: 'แสดง Order ของตัวเอง',
        security: secured,
        responses: { 200: res('สำเร็จ (ไม่มีข้อมูล = [])', list('Order')), 401: R401 },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'ดู Order 1 รายการ (เจ้าของหรือ admin)',
        security: secured,
        parameters: idParam('id ของ Order'),
        responses: { 200: res('สำเร็จ', ref('Order')), 400: R400, 401: R401 },
      },
    },
    '/orders/{id}/cancel': {
      put: {
        tags: ['Orders'],
        summary: 'ยกเลิก Order (เจ้าของหรือ admin) — คืน Stock ให้สินค้า',
        description: 'ยกเลิกได้เฉพาะสถานะ `pending` และ `confirmed` (ที่จัดส่งแล้วหรือยกเลิกไปแล้วทำซ้ำไม่ได้)',
        security: secured,
        parameters: idParam('id ของ Order'),
        responses: { 200: res('ยกเลิกแล้ว (Stock ถูกคืน)', ref('Order')), 400: R400, 401: R401 },
      },
    },
    '/orders/{id}/status': {
      put: {
        tags: ['Orders'],
        summary: 'เปลี่ยนสถานะ Order (เฉพาะ admin)',
        description: 'เปลี่ยนได้ตามลำดับ: `pending` → `confirmed` → `shipped` หรือยกเลิก `cancelled` ได้จนกว่าจะจัดส่ง (ยกเลิกจะคืน Stock)',
        security: secured,
        parameters: idParam('id ของ Order'),
        requestBody: json({ type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['confirmed', 'shipped', 'cancelled'], example: 'confirmed' } } }),
        responses: { 200: res('เปลี่ยนแล้ว', ref('Order')), 400: R400, 401: R401 },
      },
    },
    '/stats': {
      get: {
        tags: ['Stats'],
        summary: 'สถิติภาพรวมของร้าน (เฉพาะ admin)',
        description: 'ผู้ใช้ สินค้า ออเดอร์ ยอดขาย 7 วันล่าสุด สินค้าขายดี สินค้าใกล้หมด และออเดอร์ล่าสุด',
        security: secured,
        responses: { 200: res('สำเร็จ', ref('Stats')), 401: R401 },
      },
    },
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'แสดง Order ทุกรายการ',
        security: secured,
        responses: { 200: res('สำเร็จ (ไม่มีข้อมูล = [])', list('Order')), 401: R401 },
      },
    },
  },
};
