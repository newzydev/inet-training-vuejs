# Workshop 3 - Shopping Cart (Front-end + Back-end)

ระบบร้านค้าออนไลน์แบบครบวงจร อ้างอิงเอกสาร [VueJsTraining.pdf](../docs/VueJsTraining.pdf) (หน้า Workshop Front-end / Back-end)

## โจทย์

**Front-end**
- หน้าแสดงสินค้าพร้อมรายละเอียด (แบบ Shopee / Lazada) และเลือกสินค้าเข้าตะกร้าได้
- หน้าตะกร้า แสดงสินค้าพร้อมราคา เพิ่ม/ลบจำนวนได้
- หน้าจัดการสินค้าและ Order

**Back-end** = โปรเจ็กต์ `inet-training-nodejs` (Express + MongoDB) ที่คัดลอกมาไว้ใน `backend/`

## โครงสร้าง

```
workshop_3_shopping_cart/
├── backend/     REST API (Node.js + Express + MongoDB)  -> ดู backend/README.md
├── frontend/    เว็บร้านค้า (Vue 2 + Vuetify 2)          -> ดู frontend/README.md
└── README.md
```

## วิธีรันทั้งระบบ

ต้องมี Node.js และ MongoDB (พอร์ต 27017) เปิดอยู่

**1) Back-end** (เปิดเทอร์มินัลที่ 1)

```bash
cd backend
npm install
cp .env.example .env     # แล้วแก้ค่าใน .env (ถ้ายังไม่มี)
npm run seed             # สร้าง admin คนแรก (ทำครั้งเดียว)
npm start                # รันที่ http://localhost:3000
```

**2) Front-end** (เปิดเทอร์มินัลที่ 2)

```bash
cd frontend
npm install
npm run serve            # รันที่ http://localhost:8080 (หรือพอร์ตถัดไปที่ว่าง)
```

เปิดเว็บแล้วเข้าสู่ระบบด้วย admin จากไฟล์ `backend/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

## Flow การใช้งานบนเว็บ

1. **สมัครสมาชิก** ที่หน้า login -> สถานะ "รออนุมัติ"
2. **admin อนุมัติผู้ใช้** (ปัจจุบันทำผ่าน Swagger ที่ http://localhost:3000/api-docs -> `PUT /users/{id}/approve` เพราะ backend ยังไม่มี API แสดงรายชื่อผู้ใช้)
3. สมาชิก **เข้าสู่ระบบ** -> เลือกสินค้า -> ใส่ตะกร้า -> สั่งซื้อ
4. **admin** เข้าหน้า "จัดการสินค้า" (เพิ่ม/แก้ไข/ลบ พร้อมอัปโหลดรูป) และ "ออเดอร์ทั้งหมด"

## หมายเหตุ

- `backend/.env` มีค่าความลับ (รหัสผ่านฐานข้อมูล, JWT) ถูกกันไม่ให้ commit ไว้แล้วด้วย `.gitignore`
- ไฟล์รูปที่อัปโหลดอยู่ใน `backend/uploads/` (ไม่ถูก commit)
