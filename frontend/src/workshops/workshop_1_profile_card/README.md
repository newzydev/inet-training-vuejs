# Workshop 1 - นิว.dev (Personal Landing Page)

หน้า Landing Page แนะนำตัวเอง เปิดดูที่ `/workshop-1` อ้างอิงเอกสาร [VueJsTraining.pdf](../../../../docs/VueJsTraining.pdf) (หน้า Workshop 01)

## โจทย์

ทำหน้าเว็บแนะนำตัวเอง (ชื่อ-นามสกุล การศึกษา ผลงาน ความสามารถ ฯลฯ) และ Free design ตามใจชอบ
อ้างอิง [Vuetify Cards](https://v2.vuetifyjs.com/en/components/cards/)

## ส่วนต่าง ๆ ของหน้าเว็บ

| Section | เนื้อหา |
| --- | --- |
| Navbar | โลโก้ + เมนูลิงก์ไปแต่ละส่วน (โปร่งใสบน Hero, เปลี่ยนเป็นพื้นขาวเมื่อเลื่อนหน้า) |
| Hero | รูปโปรไฟล์ ชื่อ ตำแหน่ง ปุ่ม CTA และตัวเลขสถิติ |
| เกี่ยวกับฉัน | ข้อมูลส่วนตัว + คุณสมบัติส่วนตัว |
| ประสบการณ์และการศึกษา | การ์ดประสบการณ์ + Timeline การศึกษา |
| ผลงาน | การ์ดผลงาน 6 ระบบ + ลิงก์ GitHub |
| ทักษะ | ทักษะแยกกลุ่ม + ระดับภาษา |

## สิ่งที่ได้ฝึก

| หัวข้อ | ตัวอย่างในโค้ด |
| --- | --- |
| Data binding `{{ }}` / `:prop` | ชื่อ, ตำแหน่ง, สี navbar, ค่าแถบภาษา |
| `v-for` | เมนู, การ์ดผลงาน, ทักษะ |
| `data()` / `computed` | เก็บข้อมูลทั้งหมด, คำนวณสถิติ |
| Lifecycle (`mounted` / `beforeDestroy`) + `methods` | ฟังการเลื่อนหน้าเพื่อเปลี่ยนสี navbar |
| Component + `props` | `components/SectionTitle.vue` |
| Vuetify | `v-app-bar`, `v-card`, `v-timeline`, `v-chip`, `v-menu`, `v-progress-linear` |

## วิธีแก้ข้อมูล

เปิด `ProfileView.vue` แล้วแก้ใน `data()` (`profile`, `personal`, `education`, `projects`, `skills` ฯลฯ) หน้าเว็บอัปเดตเองทันที
เปลี่ยนรูปโปรไฟล์โดยแทนที่ไฟล์ `assets/profile.webp`

## โครงสร้าง

```
workshop_1_profile_card/
├── ProfileView.vue        หน้าทั้งหมด + ข้อมูล
├── components/SectionTitle.vue
└── assets/profile.webp    รูปโปรไฟล์
```

> สไตล์ของหน้านี้ถูกครอบด้วยคลาส `.w1` (ใน `ProfileView.vue`) เพื่อไม่ให้ชนกับ Workshop อื่นในแอปเดียวกัน
