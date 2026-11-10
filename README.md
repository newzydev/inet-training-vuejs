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
- MongoDB (พอร์ต 27017) เฉพาะเมื่อจะใช้ Workshop 3
- VS Code (แนะนำ)

## วิธีรัน

**Workshop 1 และ 2** ใช้แค่ Front-end

```bash
cd frontend
npm install
npm run serve
```

เปิด http://localhost:8080 แล้วเลือก Workshop จากปุ่มด้านซ้ายของหน้าจอ (ถ้าพอร์ตถูกใช้อยู่ จะขึ้นพอร์ตถัดไป ดูในเทอร์มินัล)

**Workshop 3** ต้องเปิด Back-end ด้วย (เทอร์มินัลอีกอัน)

```bash
cd backend
npm install
cp .env.example .env     # แล้วแก้ค่าใน .env (ถ้ายังไม่มี)
npm run seed             # สร้าง admin คนแรก (ทำครั้งเดียว)
npm start                # รันที่ http://localhost:3000
```

เข้าสู่ระบบ admin ด้วย `ADMIN_EMAIL` / `ADMIN_PASSWORD` ใน `backend/.env` รายละเอียดอยู่ที่ [README ของ Workshop 3](frontend/src/workshops/workshop_3_shopping_cart/README.md) และ [backend/README.md](backend/README.md)

| Command (ในโฟลเดอร์ frontend) | Description |
| --- | --- |
| `npm run serve` | รัน dev server แบบ hot-reload |
| `npm run build` | build สำหรับ production (ผลลัพธ์ใน `dist/`) |
| `npm run lint` | ตรวจและแก้ไขโค้ดด้วย ESLint |

## หมายเหตุ

- `backend/.env` มีค่าความลับ (รหัสผ่านฐานข้อมูล, JWT) ถูกกันไม่ให้ commit ไว้ด้วย `.gitignore`
- ไฟล์รูปที่อัปโหลดอยู่ใน `backend/uploads/` (ไม่ถูก commit)
