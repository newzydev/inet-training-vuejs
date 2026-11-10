# Workshop 1 - Personal Landing Page

หน้า Landing Page แนะนำตัวเอง ทำด้วย Vue 2 + Vuetify 2 อ้างอิงเอกสาร [VueJsTraining.pdf](../docs/VueJsTraining.pdf) (หน้า Workshop 01)

## โจทย์

ทำหน้าเว็บแนะนำตัวเอง (ชื่อ-นามสกุล, การศึกษา, งานอดิเรก/ความสามารถ ฯลฯ) และ Free design ตามใจชอบ
อ้างอิง [Vuetify Cards](https://v2.vuetifyjs.com/en/components/cards/)

## ส่วนต่าง ๆ ของหน้าเว็บ

| Section | เนื้อหา |
| --- | --- |
| Navbar | โลโก้ + เมนูลิงก์ไปแต่ละส่วน (โปร่งใสบน Hero, เปลี่ยนเป็นพื้นขาวเมื่อเลื่อนหน้า) |
| Hero | ชื่อ ตำแหน่ง ปุ่ม CTA และตัวเลขสถิติ |
| เกี่ยวกับฉัน | ข้อมูลส่วนตัว + คุณสมบัติส่วนตัว |
| ประสบการณ์และการศึกษา | การ์ดประสบการณ์ + Timeline การศึกษา |
| ผลงาน | การ์ดผลงาน 6 ระบบ + ลิงก์ GitHub |
| ทักษะ | ทักษะแยกกลุ่ม + ระดับภาษา |

รองรับจอคอมและมือถือ (เมนูกลายเป็นปุ่ม hamburger)

## สิ่งที่ได้ฝึก

| หัวข้อ | ตัวอย่างในโค้ด |
| --- | --- |
| Data binding `{{ }}` / `:prop` | ชื่อ, ตำแหน่ง, สี navbar, ค่าแถบภาษา |
| `v-for` | เมนู, การ์ดผลงาน, ทักษะ |
| `data()` / `computed` | เก็บข้อมูลทั้งหมด, คำนวณตัวอักษรย่อและสถิติ |
| Lifecycle (`mounted` / `beforeDestroy`) + `methods` | ฟังการเลื่อนหน้าเพื่อเปลี่ยนสี navbar |
| Component + `props` | `components/SectionTitle.vue` |
| Vuetify | `v-app-bar`, `v-card`, `v-timeline`, `v-chip`, `v-menu`, `v-progress-linear` |

## วิธีรัน

```bash
npm install
npm run serve
```

เปิด http://localhost:8080 (ถ้าพอร์ตถูกใช้อยู่จะขึ้นพอร์ตถัดไป ดูในเทอร์มินัล)

## วิธีแก้ข้อมูล

เปิด `src/App.vue` แล้วแก้ใน `data()` (`profile`, `personal`, `education`, `projects`, `skills` ฯลฯ) หน้าเว็บอัปเดตเองทันที

## โครงสร้าง

```
workshop_1_profile_card/
├── public/index.html          ฟอนต์ Kanit + IBM Plex Sans Thai, ไอคอน MDI
└── src/
    ├── assets/profile.webp    รูปโปรไฟล์ (เปลี่ยนรูปโดยแทนที่ไฟล์นี้)
    ├── plugins/vuetify.js     ตั้งค่า Vuetify และสีธีม
    ├── components/SectionTitle.vue
    ├── App.vue                หน้า Landing Page + ข้อมูล
    └── main.js
```
