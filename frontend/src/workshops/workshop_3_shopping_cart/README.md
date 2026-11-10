# Workshop 3 - นิว.shop (Shopping Cart)

ระบบร้านค้าออนไลน์ เปิดดูที่ `/workshop-3` เชื่อมกับ REST API ใน [`backend/`](../../../../backend) อ้างอิงเอกสาร [VueJsTraining.pdf](../../../../docs/VueJsTraining.pdf) (หน้า Workshop Front-end / Back-end)

## โจทย์

**Front-end**
- หน้าแสดงสินค้าพร้อมรายละเอียด (แบบ Shopee / Lazada) และเลือกสินค้าเข้าตะกร้าได้
- หน้าตะกร้า แสดงสินค้าพร้อมราคา เพิ่ม/ลบจำนวนได้
- หน้าจัดการสินค้าและ Order

**Back-end** = โปรเจ็กต์ `inet-training-nodejs` (Express + MongoDB) ที่ใช้เป็น `backend/` ของ repo นี้ (เพิ่ม API ให้ครบวงจรร้านค้าแล้ว ดู [backend/README.md](../../../../backend/README.md))

## ต้องรัน Back-end ก่อน

Workshop นี้ต้องมี MongoDB (พอร์ต 27017) และ Back-end เปิดอยู่ ดูวิธีที่ [README หลัก](../../../../README.md)
**ถ้าเคยรัน Back-end ไว้ก่อนอัปเดต API ใหม่ ให้รีสตาร์ตด้วย** (ไม่งั้นหน้า "ออเดอร์ของฉัน" และ "ภาพรวม" ของ admin จะเรียก API ที่ยังไม่มี)

## หน้าต่าง ๆ

**สมาชิก**

| Route | หน้า | สิ่งที่ทำได้ |
| --- | --- | --- |
| `/workshop-3/login` | เข้าสู่ระบบ / สมัครสมาชิก | สมัครแล้วรอ admin อนุมัติ |
| `/workshop-3` | หน้าร้าน | ค้นหา, กรอง (ทั้งหมด/มีของ/เหลือน้อย), เรียงลำดับ, ใส่ตะกร้าจากการ์ดได้ทันที |
| `/workshop-3/product/:id` | รายละเอียดสินค้า | แถบสต็อก, เลือกจำนวน (ไม่เกินสต็อก), ใส่ตะกร้า, ซื้อเลย, สินค้าอื่น ๆ |
| `/workshop-3/cart` | ตะกร้า (เต็มหน้า) | เพิ่ม/ลดจำนวน, ลบ, ล้างตะกร้า, สั่งซื้อ |
| `/workshop-3/orders` | ออเดอร์ของฉัน | ดูสถานะและขั้นตอน, กรองตามสถานะ, **ยกเลิกออเดอร์** (คืนสต็อก) |

นอกจากหน้าตะกร้าแล้ว ยังมี **ตะกร้าแบบ drawer** (กดไอคอนตะกร้าบนแถบเมนู) ใช้ดู/แก้/สั่งซื้อได้โดยไม่ต้องเปลี่ยนหน้า และ **โปรไฟล์** (เมนูผู้ใช้ -> โปรไฟล์ของฉัน) แก้ชื่อ เปลี่ยนรูป เปลี่ยนรหัสผ่าน

**ผู้ดูแลระบบ (admin)** เมนู "จัดการร้าน" -> `/workshop-3/admin` มี 4 แท็บ

| Route | แท็บ | สิ่งที่ทำได้ |
| --- | --- | --- |
| `/workshop-3/admin/dashboard` | ภาพรวม | ยอดขาย, กราฟ 7 วัน, สถานะออเดอร์, สินค้าขายดี, สินค้าใกล้หมด, ออเดอร์ล่าสุด, แจ้งผู้สมัครที่รออนุมัติ |
| `/workshop-3/admin/products` | สินค้า | เพิ่ม/แก้ไข/ลบสินค้า พร้อมอัปโหลดรูป |
| `/workshop-3/admin/orders` | ออเดอร์ | ดูทุกออเดอร์, กรอง/ค้นหา, เลื่อนสถานะ (ยืนยัน -> จัดส่งแล้ว), ยกเลิก (คืนสต็อก) |
| `/workshop-3/admin/users` | ผู้ใช้ | อนุมัติ/ปฏิเสธผู้สมัคร, ระงับสิทธิ์, เปลี่ยนบทบาท, ลบผู้ใช้ |

## Flow การใช้งาน

1. **สมัครสมาชิก** ที่หน้า login -> สถานะ "รออนุมัติ"
2. **admin อนุมัติ** ที่แท็บ "ผู้ใช้" แล้วสมาชิกเข้าสู่ระบบได้ทันที
3. สมาชิก **เลือกสินค้า -> ใส่ตะกร้า -> สั่งซื้อ** ออเดอร์เริ่มที่ "รอยืนยัน"
4. **admin** ยืนยันและจัดส่งออเดอร์ที่แท็บ "ออเดอร์" (ถ้ายกเลิก สต็อกจะถูกคืน)

เข้าสู่ระบบ admin ด้วยค่า `ADMIN_EMAIL` / `ADMIN_PASSWORD` ใน `backend/.env`

## จับคู่กับ API ของ Back-end

| การทำงานบนเว็บ | API |
| --- | --- |
| เข้าสู่ระบบ / สมัครสมาชิก | `POST /login`, `POST /register` |
| แสดงสินค้า / รายละเอียด | `GET /products`, `GET /products/:id` |
| สั่งซื้อ (ทีละสินค้าในตะกร้า) | `POST /products/:id/orders` |
| ออเดอร์ของฉัน / ยกเลิก | `GET /orders/me`, `PUT /orders/:id/cancel` |
| โปรไฟล์ | `PUT /users/me`, `PUT /users/me/avatar` |
| ภาพรวม admin | `GET /stats` |
| จัดการสินค้า | `POST /products`, `PUT /products/:id`, `DELETE /products/:id` (ส่งเป็น `FormData` เพื่อแนบรูป `image`) |
| จัดการออเดอร์ | `GET /orders`, `PUT /orders/:id/status`, `PUT /orders/:id/cancel` |
| จัดการผู้ใช้ | `GET /users`, `PUT /users/:id/approve`, `/revoke`, `/role`, `DELETE /users/:id` |

## จุดที่ควรรู้ (การตัดสินใจในการออกแบบ)

- **ตะกร้าเก็บฝั่งเบราว์เซอร์** (Vuex + localStorage) เพราะ backend ไม่มี API ตะกร้า
- **สั่งซื้อ** = วนยิง `POST /products/:id/orders` ทีละสินค้า (`utils/checkout.js`) รายการที่สำเร็จจะถูกเอาออกจากตะกร้า ส่วนที่ไม่สำเร็จ (เช่น สต็อกไม่พอ) จะแจ้งสาเหตุให้เห็น
- เปิดตะกร้า (drawer หรือหน้าเต็ม) ทุกครั้งจะ **เทียบกับสต็อก/ราคาจริง** อัตโนมัติ ถ้าสินค้าหมดจะถูกนำออกพร้อมแจ้งเตือน
- ออเดอร์ที่ยังไม่จัดส่งยกเลิกได้ และ **สต็อกถูกคืนครั้งเดียว** (ยกเลิกซ้ำไม่ได้)
- ข้อความ error จาก backend แปลเป็นภาษาไทยใน `api.js` และจะ **ออกจากระบบอัตโนมัติเฉพาะเมื่อ token ใช้ไม่ได้** (401 แบบ "ไม่มีสิทธิ์" เช่น admin only ไม่ทำให้หลุดจากระบบ)
- ถ้า Back-end ไม่ได้อยู่ที่ `http://localhost:3000` ให้คัดลอก `frontend/.env.example` เป็น `.env` แล้วแก้ `VUE_APP_API_URL`

## โครงสร้าง

```
workshop_3_shopping_cart/
├── ShopLayout.vue          โครงหน้า: แถบเมนู (กระจกฝ้า) + ตะกร้า drawer + โปรไฟล์ + แจ้งเตือน (ครอบด้วยคลาส .w3)
├── routes.js               เส้นทางใต้ /workshop-3 + ด่านตรวจสิทธิ์ (guest / login / admin)
├── api.js                  axios กลาง (แนบ token, แปลง error เป็นไทย, imageUrl)
├── store/                  auth.js (ผู้ใช้), cart.js (ตะกร้า), index.js (แจ้งเตือน + เปิด/ปิด drawer)
├── utils/                  format.js (ราคา/วันที่), status.js (สถานะออเดอร์), checkout.js (สั่งซื้อ/รีเฟรชตะกร้า)
├── components/             ProductCard, ProductImage, QtyStepper, CartDrawer, ProfileDialog,
│                           ProductFormDialog, ConfirmDialog, OrderStatusChip
└── views/
    ├── LoginView, ShopView, ProductView, CartView, OrdersView
    └── admin/              AdminLayout (แท็บ), DashboardView, ProductsView, OrdersView, UsersView
```

## หมายเหตุเรื่องสไตล์

- อย่าตั้งชื่อคลาสของตัวเองซ้ำกับคลาสสีของ Vuetify (`.info`, `.success`, `.error`, `.primary` ฯลฯ) เพราะ Vuetify ใส่สีพื้นหลังให้อัตโนมัติ (เคยเจอ `.info` ทำให้บล็อกในตะกร้าเป็นสีน้ำเงิน)
- ป๊อปอัป/เมนูของ Vuetify (`v-dialog`, `v-menu`) ถูกย้ายออกนอก `.w3` ให้ใช้สไตล์แบบ `scoped` ในคอมโพเนนต์นั้นแทน
