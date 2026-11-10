# Workshop 3 - นิว.shop (Shopping Cart)

ระบบร้านค้าออนไลน์ เปิดดูที่ `/workshop-3` เชื่อมกับ REST API ใน [`backend/`](../../../../backend) อ้างอิงเอกสาร [VueJsTraining.pdf](../../../../docs/VueJsTraining.pdf) (หน้า Workshop Front-end / Back-end)

## โจทย์

**Front-end**
- หน้าแสดงสินค้าพร้อมรายละเอียด (แบบ Shopee / Lazada) และเลือกสินค้าเข้าตะกร้าได้
- หน้าตะกร้า แสดงสินค้าพร้อมราคา เพิ่ม/ลบจำนวนได้
- หน้าจัดการสินค้าและ Order

**Back-end** = โปรเจ็กต์ `inet-training-nodejs` (Express + MongoDB) ที่ใช้เป็น `backend/` ของ repo นี้

## ต้องรัน Back-end ก่อน

Workshop นี้ต้องมี MongoDB (พอร์ต 27017) และ Back-end เปิดอยู่ ดูวิธีที่ [README หลัก](../../../../README.md)

## หน้าต่าง ๆ

| Route | หน้า | ใครเข้าได้ | สิ่งที่ทำได้ |
| --- | --- | --- | --- |
| `/workshop-3/login` | เข้าสู่ระบบ / สมัครสมาชิก | ทุกคน | สมัครแล้วรอ admin อนุมัติ |
| `/workshop-3` | หน้าร้าน | สมาชิก | ค้นหา, เรียงราคา, กรองเฉพาะที่มีของ, ใส่ตะกร้า |
| `/workshop-3/product/:id` | รายละเอียดสินค้า | สมาชิก | เลือกจำนวน (ไม่เกินสต็อก), ใส่ตะกร้า, ซื้อเลย |
| `/workshop-3/cart` | ตะกร้า | สมาชิก | เพิ่ม/ลดจำนวน, ลบ, ล้างตะกร้า, สั่งซื้อ |
| `/workshop-3/orders` | ออเดอร์ | สมาชิก (เห็นของตัวเอง) / admin (เห็นทั้งหมด) | ดูประวัติและยอดรวม |
| `/workshop-3/manage` | จัดการสินค้า | **admin** | เพิ่ม/แก้ไข/ลบสินค้า พร้อมอัปโหลดรูป |

## Flow การใช้งาน

1. **สมัครสมาชิก** ที่หน้า login -> สถานะ "รออนุมัติ"
2. **admin อนุมัติผู้ใช้** (ทำผ่าน Swagger ที่ http://localhost:3000/api-docs -> `PUT /users/{id}/approve` เพราะ backend ยังไม่มี API แสดงรายชื่อผู้ใช้)
3. สมาชิก **เข้าสู่ระบบ** -> เลือกสินค้า -> ใส่ตะกร้า -> สั่งซื้อ
4. **admin** เข้าหน้า "จัดการสินค้า" และ "ออเดอร์ทั้งหมด"

เข้าสู่ระบบ admin ด้วยค่า `ADMIN_EMAIL` / `ADMIN_PASSWORD` ใน `backend/.env`

## จับคู่กับ API ของ Back-end

| การทำงานบนเว็บ | API |
| --- | --- |
| เข้าสู่ระบบ / สมัครสมาชิก | `POST /login`, `POST /register` |
| แสดงสินค้า / รายละเอียด | `GET /products`, `GET /products/:id` |
| สั่งซื้อ (ทีละสินค้าในตะกร้า) | `POST /products/:id/orders` |
| ดูออเดอร์ | `GET /orders` |
| จัดการสินค้า | `POST /products`, `PUT /products/:id`, `DELETE /products/:id` (ส่งเป็น `FormData` เพื่อแนบรูป `image`) |

## จุดที่ควรรู้ (การตัดสินใจในการออกแบบ)

- **ตะกร้าเก็บฝั่งเบราว์เซอร์** (Vuex + localStorage) เพราะ backend ไม่มี API ตะกร้า
- **สั่งซื้อ** = วนยิง `POST /products/:id/orders` ทีละสินค้า รายการที่สำเร็จจะถูกเอาออกจากตะกร้า ส่วนที่ไม่สำเร็จ (เช่น สต็อกไม่พอ) จะแจ้งสาเหตุให้เห็น
- เปิดหน้าตะกร้าทุกครั้งจะ **เทียบกับสต็อก/ราคาจริง** อัตโนมัติ ถ้าสินค้าหมดจะถูกนำออกพร้อมแจ้งเตือน
- **ออเดอร์ของสมาชิก** กรองฝั่งเว็บ เพราะ `GET /orders` ส่งออเดอร์ทั้งระบบมา (เป็นข้อจำกัดของ backend ปัจจุบัน)
- backend **ไม่มี API ดูรายชื่อผู้ใช้** จึงยังไม่มีหน้าอนุมัติผู้ใช้บนเว็บ
- token หมดอายุ/ไม่ถูกต้อง (401) -> ออกจากระบบและกลับหน้า login อัตโนมัติ
- ถ้า Back-end ไม่ได้อยู่ที่ `http://localhost:3000` ให้คัดลอก `frontend/.env.example` เป็น `.env` แล้วแก้ `VUE_APP_API_URL`

## โครงสร้าง

```
workshop_3_shopping_cart/
├── ShopLayout.vue          โครงหน้า: แถบเมนู + แจ้งเตือน (ครอบด้วยคลาส .w3)
├── routes.js               เส้นทางใต้ /workshop-3 + ด่านตรวจสิทธิ์ (guest / login / admin)
├── api.js                  axios กลาง (แนบ token, แปลง error เป็นไทย, imageUrl)
├── store/                  auth.js (ผู้ใช้), cart.js (ตะกร้า), index.js (แจ้งเตือน)
├── utils/format.js         จัดรูปแบบราคา/วันที่
├── components/             ProductCard, ProductImage, QtyStepper, ProductFormDialog
└── views/                  Login, Shop, Product, Cart, Orders, Manage
```
