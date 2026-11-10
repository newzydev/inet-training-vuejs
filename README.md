# inet-training-vuejs

Workshop ของการอบรม Vue.js (INET Training) จำนวน 3 งาน รวมอยู่ในแอปเดียว มีปุ่มเลือก Workshop ด้านซ้ายของหน้าจอ
อ้างอิงเอกสาร [docs/VueJsTraining.pdf](docs/VueJsTraining.pdf) โปรเจ็กต์ตัวอย่างประกอบการสอนอยู่ที่ `inet-training-exvuejs`

## Workshops

| # | ชื่อ | Route | โจทย์ | โค้ดและคำอธิบาย |
| --- | --- | --- | --- | --- |
| 1 | นิว.dev | `/workshop-1` | หน้าเว็บแนะนำตัวเอง (Landing page) ด้วย Vuetify Cards | [workshop_1_profile_card](frontend/src/workshops/workshop_1_profile_card) |
| 2 | นิว.grade | `/workshop-2` | โปรแกรมตัดเกรด: รับคะแนน 0-100 แล้วแสดงเกรด A-F พร้อมแจ้งเตือนเมื่อกรอกไม่ถูกต้อง | [workshop_2_grade_calculator](frontend/src/workshops/workshop_2_grade_calculator) |
| 3 | นิว.shop | `/workshop-3` | Front-end ร้านค้า: หน้าสินค้า, ตะกร้า, จัดการสินค้าและ Order เชื่อมกับ Back-end | [workshop_3_shopping_cart](frontend/src/workshops/workshop_3_shopping_cart) |

เกณฑ์เกรดของ Workshop 2: A 80-100, B 70-79, C 60-69, D 50-59, F 0-49

## โครงสร้าง

```
inet-training-vuejs/
├── frontend/     แอป Vue 2 + Vuetify 2 (มีทั้ง 3 Workshop อยู่ใน src/workshops/)
├── backend/      REST API (Node.js + Express + MongoDB) สำหรับ Workshop 3
├── docs/         เอกสารประกอบ (VueJsTraining.pdf)
├── .gitignore
└── README.md
```

## Tech stack

- Front-end: Vue 2 + Vue CLI 5, Vuetify 2, Vue Router, Vuex, Axios, ESLint
- Back-end: Node.js, Express, MongoDB (Mongoose), JWT, multer, Swagger

## Requirements

- Node.js 16 ขึ้นไป (ทดสอบกับ v22) และ npm
- MongoDB (พอร์ต 27017) เปิดไว้ก่อนรัน Back-end
- VS Code (แนะนำ)

## วิธีรัน

เปิด **2 เทอร์มินัล** แล้วรันตามลำดับ: **Back-end ก่อน** แล้วค่อย **Front-end** (เปิดให้ครบทั้งสองตัว จะใช้ได้ทั้ง 3 Workshop)

**1) Back-end** (เทอร์มินัลที่ 1)

```bash
cd backend
npm install
cp .env.example .env     # ครั้งแรกเท่านั้น: แล้วแก้ค่าใน .env
npm run seed             # ครั้งแรกเท่านั้น: สร้าง admin คนแรก
npm start                # รอจนเห็น "MongoDB connected" (รันที่ http://localhost:3000)
```

**2) Front-end** (เทอร์มินัลที่ 2)

```bash
cd frontend
npm install
npm run serve
```

เปิด http://localhost:8080 แล้วเลือก Workshop จากปุ่มด้านซ้ายของหน้าจอ (ถ้าพอร์ตถูกใช้อยู่ จะขึ้นพอร์ตถัดไป ดูในเทอร์มินัล)

เข้าสู่ระบบ admin ของ Workshop 3 ด้วย `ADMIN_EMAIL` / `ADMIN_PASSWORD` ใน `backend/.env` รายละเอียดอยู่ที่ [README ของ Workshop 3](frontend/src/workshops/workshop_3_shopping_cart/README.md) และ [backend/README.md](backend/README.md)

> ถ้า `npm start` ขึ้น `Port 3000 is already in use` แปลว่ามี Back-end รันอยู่แล้ว ให้ปิดตัวเก่าก่อน (หรือ `Ctrl+C` ในเทอร์มินัลเดิม)

| Command | โฟลเดอร์ | Description |
| --- | --- | --- |
| `npm start` | backend | รัน API (รีสตาร์ตเองเมื่อแก้โค้ดด้วย nodemon) |
| `npm run seed` | backend | สร้าง admin คนแรก (ทำครั้งเดียว) |
| `npm run serve` | frontend | รัน dev server แบบ hot-reload |
| `npm run build` | frontend | build สำหรับ production (ผลลัพธ์ใน `dist/`) |
| `npm run lint` | frontend | ตรวจและแก้ไขโค้ดด้วย ESLint |

## หมายเหตุ

- `backend/.env` มีค่าความลับ (รหัสผ่านฐานข้อมูล, JWT) ถูกกันไม่ให้ commit ไว้ด้วย `.gitignore`
- ไฟล์รูปที่อัปโหลดอยู่ใน `backend/uploads/` (ไม่ถูก commit)
