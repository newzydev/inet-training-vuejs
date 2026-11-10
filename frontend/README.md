# frontend

แอป Vue 2 + Vuetify 2 ตัวเดียวที่รวม Workshop ทั้ง 3 ไว้ด้วยกัน มีปุ่มเลือก Workshop ลอยอยู่ด้านซ้ายตรงกลางจอ (บนมือถืออยู่ล่างกลางจอ)

| ปุ่ม | Workshop | Route | โค้ด |
| --- | --- | --- | --- |
| 1 | นิว.dev (Profile) | `/workshop-1` | [workshop_1_profile_card](src/workshops/workshop_1_profile_card) |
| 2 | นิว.grade (Grade) | `/workshop-2` | [workshop_2_grade_calculator](src/workshops/workshop_2_grade_calculator) |
| 3 | นิว.shop (Shop) | `/workshop-3` | [workshop_3_shopping_cart](src/workshops/workshop_3_shopping_cart) |

## วิธีรัน

```bash
npm install
npm run serve
```

เปิด http://localhost:8080 (ถ้าพอร์ตถูกใช้อยู่ จะขึ้นพอร์ตถัดไป ดูในเทอร์มินัล)
Workshop 1 และ 2 ใช้ได้ทันที ส่วน Workshop 3 ต้องเปิด [backend](../backend) ก่อน

| Command | Description |
| --- | --- |
| `npm run serve` | รัน dev server แบบ hot-reload |
| `npm run build` | build สำหรับ production (ผลลัพธ์ใน `dist/`) |
| `npm run lint` | ตรวจและแก้ไขโค้ดด้วย ESLint |

## โครงสร้าง

```
src/
├── main.js                 จุดเริ่มต้น (Vue, router, store, filter)
├── App.vue                 โครงรวม: แถบเลือก Workshop + <router-view />
├── router/index.js         เส้นทางทั้งหมด (รวม route ของ Workshop 3)
├── plugins/vuetify.js      ธีม + ภาษาไทย
├── shell/WorkshopRail.vue  แถบเลือก Workshop ด้านซ้าย
├── shell/AppField.vue      ช่องกรอกมาตรฐาน (label อยู่ด้านบน) ใช้ครอบ v-text-field ทุกที่
└── workshops/
    ├── index.js            รายการ Workshop (ใช้ทำปุ่มเลือก)
    ├── workshop_1_profile_card/      ProfileView.vue + README.md
    ├── workshop_2_grade_calculator/  GradeView.vue + README.md
    └── workshop_3_shopping_cart/     ShopLayout.vue, routes.js, views/, store/ ... + README.md
```

## เพิ่ม Workshop ใหม่

1. สร้างโฟลเดอร์ใน `src/workshops/` พร้อมหน้า `.vue` (ครอบด้วย `<div class="wN">` และใส่สไตล์ไว้ใต้ `.wN` เพื่อไม่ชนกับ Workshop อื่น)
2. เพิ่ม route ใน `src/router/index.js`
3. เพิ่มรายการใน `src/workshops/index.js` (ปุ่มเลือกจะขึ้นเอง)

## ข้อควรระวังเรื่องสไตล์

ทุก Workshop อยู่ในหน้าเว็บเดียวกัน จึงต้องครอบสไตล์ด้วยคลาสประจำ Workshop (`.w1`, `.w2`, `.w3`) ไม่งั้นคลาสชื่อซ้ำ (เช่น `.hero`, `.card`, `.brand`) จะทับกัน
ส่วนองค์ประกอบที่ Vuetify ย้ายไปแสดงนอกคอมโพเนนต์ (เช่นป๊อปอัป `v-dialog`) จะไม่อยู่ใต้ `.wN` จึงต้องใช้คลาสส่วนกลาง (เช่น `.display-font` ใน `App.vue`)
