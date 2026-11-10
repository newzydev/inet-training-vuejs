# inet-training-vuejs

Workshop ของการอบรม Vue.js (INET Training) จำนวน 3 งาน อ้างอิงเอกสาร [docs/VueJsTraining.pdf](docs/VueJsTraining.pdf)
โปรเจ็กต์ตัวอย่างประกอบการสอนอยู่ที่ `inet-training-exvuejs`

## Workshops

| # | โฟลเดอร์ | โจทย์ | สถานะ |
| --- | --- | --- | --- |
| 1 | [workshop_1_profile_card](workshop_1_profile_card) | หน้าเว็บแนะนำตัวเอง (Landing page) ด้วย Vuetify Cards | เสร็จแล้ว |
| 2 | [workshop_2_grade_calculator](workshop_2_grade_calculator) | โปรแกรมตัดเกรด: รับคะแนน 0-100 จาก textfield แล้วแสดงเกรด A-F พร้อมแจ้งเตือนเมื่อกรอกไม่ถูกต้อง | เสร็จแล้ว |
| 3 | [workshop_3_shopping_cart](workshop_3_shopping_cart) | Front-end ร้านค้า: หน้าสินค้า, ตะกร้า (เพิ่ม/ลบ), หน้าจัดการสินค้าและ Order เชื่อมกับ Workshop Back-end | เสร็จแล้ว (`frontend/` + `backend/`) |

เกณฑ์เกรดของ Workshop 2: A 80-100, B 70-79, C 60-69, D 50-59, F 0-49

## Tech stack

- Vue 2 + Vue CLI 5
- Vuetify 2
- ESLint (error prevention)
- (Workshop 3) Axios, Vue Router, Vuex ตามความเหมาะสม

## Requirements

- Node.js 16 ขึ้นไป (ทดสอบกับ v22) และ npm
- VS Code (แนะนำ)

## วิธีรันแต่ละ Workshop

แต่ละโฟลเดอร์เป็นโปรเจ็กต์แยกกัน มี `package.json` ของตัวเอง

```bash
cd workshop_1_profile_card
npm install
npm run serve
```

เปิด http://localhost:8080 (ถ้าพอร์ตถูกใช้อยู่ จะขึ้นพอร์ตถัดไป ดูในเทอร์มินัล)

| Command | Description |
| --- | --- |
| `npm run serve` | รัน dev server แบบ hot-reload |
| `npm run build` | build สำหรับ production (ผลลัพธ์ใน `dist/`) |
| `npm run lint` | ตรวจและแก้ไขโค้ดด้วย ESLint |

## โครงสร้าง

```
inet-training-vuejs/
├── docs/                          เอกสารประกอบ (VueJsTraining.pdf)
├── workshop_1_profile_card/       Landing page แนะนำตัว
├── workshop_2_grade_calculator/   โปรแกรมตัดเกรด
├── workshop_3_shopping_cart/      ร้านค้า + ตะกร้า
│   ├── frontend/                  เว็บร้านค้า (Vue 2 + Vuetify 2)
│   └── backend/                   Back-end (คัดลอกจาก inet-training-nodejs, Express + MongoDB)
├── .gitignore                     ใช้ร่วมกันทุก Workshop (ไม่ commit node_modules, dist)
└── README.md
```

แต่ละโฟลเดอร์ Workshop มี `README.md` ของตัวเองอธิบายโจทย์และสิ่งที่ได้ฝึก
