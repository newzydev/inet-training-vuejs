# Workshop 3 - Front-end (นิว.shop)

เว็บร้านค้าออนไลน์ ทำด้วย Vue 2 + Vuetify 2 เชื่อมกับ REST API ใน `../backend`

## Tech stack

- Vue 2 + Vue CLI 5, Vuetify 2 (ภาษาไทย)
- Vue Router (history mode + ด่านตรวจสิทธิ์), Vuex (ผู้ใช้ + ตะกร้า)
- Axios (interceptor แนบ token และแปลง error เป็นภาษาไทย)

## หน้าต่าง ๆ

| Route | หน้า | ใครเข้าได้ | สิ่งที่ทำได้ |
| --- | --- | --- | --- |
| `/login` | เข้าสู่ระบบ / สมัครสมาชิก | ทุกคน | สมัครแล้วรอ admin อนุมัติ |
| `/` | หน้าร้าน | สมาชิก | ค้นหา, เรียงราคา, กรองเฉพาะที่มีของ, ใส่ตะกร้า |
| `/product/:id` | รายละเอียดสินค้า | สมาชิก | เลือกจำนวน (ไม่เกินสต็อก), ใส่ตะกร้า, ซื้อเลย |
| `/cart` | ตะกร้า | สมาชิก | เพิ่ม/ลดจำนวน, ลบ, ล้างตะกร้า, สั่งซื้อ |
| `/orders` | ออเดอร์ | สมาชิก (เห็นของตัวเอง) / admin (เห็นทั้งหมด) | ดูประวัติและยอดรวม |
| `/manage` | จัดการสินค้า | **admin** | เพิ่ม/แก้ไข/ลบสินค้า พร้อมอัปโหลดรูป |

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
- backend **ไม่มี API ดูรายชื่อผู้ใช้** จึงยังไม่มีหน้าอนุมัติผู้ใช้บนเว็บ (ใช้ Swagger ชั่วคราว)
- token หมดอายุ/ไม่ถูกต้อง (401) -> ออกจากระบบและกลับหน้า login อัตโนมัติ

## วิธีรัน

ต้องรัน Back-end ก่อน (ดู [../README.md](../README.md))

```bash
npm install
npm run serve
```

ถ้า Back-end ไม่ได้อยู่ที่ `http://localhost:3000` ให้คัดลอก `.env.example` เป็น `.env` แล้วแก้ `VUE_APP_API_URL`

| Command | Description |
| --- | --- |
| `npm run serve` | รัน dev server แบบ hot-reload |
| `npm run build` | build สำหรับ production (ผลลัพธ์ใน `dist/`) |
| `npm run lint` | ตรวจและแก้ไขโค้ดด้วย ESLint |

## โครงสร้างโค้ด

```
src/
├── api.js                  axios กลาง (แนบ token, แปลง error เป็นไทย, imageUrl)
├── main.js                 จุดเริ่มต้น + filter (baht, dateTime)
├── App.vue                 แถบเมนู + snackbar + สไตล์รวม
├── router/index.js         เส้นทาง + ด่านตรวจสิทธิ์ (guest / login / admin)
├── store/                  auth.js (ผู้ใช้), cart.js (ตะกร้า), index.js (แจ้งเตือน)
├── plugins/vuetify.js      ธีม + ภาษาไทย
├── utils/format.js         จัดรูปแบบราคา/วันที่
├── components/
│   ├── ProductCard.vue         การ์ดสินค้า
│   ├── ProductImage.vue        รูปสินค้า (ไม่มีรูปแสดงพื้นไล่สี)
│   ├── QtyStepper.vue          ปุ่ม − 1 + (ใช้กับ v-model)
│   └── ProductFormDialog.vue   ฟอร์มเพิ่ม/แก้ไขสินค้า
└── views/                  Login, Shop, Product, Cart, Orders, Manage
```
