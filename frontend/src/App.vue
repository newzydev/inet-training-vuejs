<template>
  <v-app>
    <!-- แถบเลือก Workshop (ลอยด้านซ้ายตรงกลางจอ) -->
    <WorkshopRail />

    <!-- แต่ละ Workshop คือหน้าหนึ่งของ router: ProfileView / GradeView / ShopLayout -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import WorkshopRail from '@/components/WorkshopRail.vue'

export default {
  components: { WorkshopRail }
}
</script>

<style>
/* สไตล์ส่วนกลางที่ทุก Workshop ใช้ร่วมกัน (สไตล์เฉพาะของแต่ละ Workshop อยู่ใต้ .w1 / .w2 / .w3) */

/* ================= ฟอนต์: กำหนดที่นี่ที่เดียว =================
   อยากเปลี่ยนฟอนต์ทั้งเว็บ แก้แค่ 2 บรรทัดนี้ (และลิงก์โหลดฟอนต์ใน public/index.html)
   ที่อื่นห้ามเขียนชื่อฟอนต์ตรง ๆ ให้ใช้ var(--font-body) หรือ var(--font-heading) แทน */
:root {
  --font-body: 'IBM Plex Sans Thai', sans-serif; /* เนื้อหาทั้งแอป */
  --font-heading: 'Kanit', 'IBM Plex Sans Thai', sans-serif; /* หัวข้อ h1-h6 ราคา ตัวเลขเด่น */
}
html, body, .v-application { font-family: var(--font-body) !important; }

/* ปุ่ม/ช่องกรอกของเบราว์เซอร์ไม่สืบทอดฟอนต์เอง ต้องสั่งให้สืบทอด */
.v-application button, .v-application input, .v-application textarea, .v-application select { font-family: inherit; }

/* Vuetify บังคับฟอนต์ Roboto (ไม่มีอักษรไทย) ให้คลาสตัวอักษรของมันทั้งชุด เช่น .caption .title .headline .text-h1
   จึงต้องเขียนทับทั้งชุดนี้ ไม่งั้นข้อความไทยจะตกไปใช้ฟอนต์ไทยของระบบแทน
   (ใส่ "body" นำหน้าเพื่อให้ความเฉพาะเจาะจงสูงกว่า Vuetify เพราะ CSS ของ App.vue ถูกใส่ก่อน CSS ของ Vuetify) */
body .v-application .display-4, body .v-application .display-3, body .v-application .display-2, body .v-application .display-1,
body .v-application .headline, body .v-application .title, body .v-application .subtitle-1, body .v-application .subtitle-2,
body .v-application .body-1, body .v-application .body-2, body .v-application .caption, body .v-application .overline,
body .v-application [class*='text-h'], body .v-application [class*='text-subtitle'], body .v-application [class*='text-body'],
body .v-application [class*='text-caption'], body .v-application [class*='text-overline'], body .v-application [class*='text-button'] {
  font-family: var(--font-body) !important;
}

/* หัวข้อทุกระดับใช้ฟอนต์หัวข้อ (.font-heading / .display-font ใช้กับ element อื่นที่อยากได้ฟอนต์หัวข้อ) */
.v-application h1, .v-application h2, .v-application h3, .v-application h4, .v-application h5, .v-application h6,
.v-application .font-heading, .v-application .display-font {
  font-family: var(--font-heading) !important;
}

.v-application.theme--light { background: #f4f2fc !important; }
html { scroll-behavior: smooth; }

/* พื้นหลัง Hero แบบเดียวกันทุก Workshop (ใส่คลาส hero-bg ที่ส่วนหัว): ไล่สีม่วง-ชมพู + วงกลมโปร่งแสงตกแต่ง */
.hero-bg {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 18%, rgba(236, 72, 153, 0.45), transparent 42%),
    radial-gradient(circle at 70% 92%, rgba(124, 58, 237, 0.55), transparent 45%),
    linear-gradient(145deg, #1e1b6e 0%, #4338ca 50%, #6d28d9 100%);
}
.hero-bg::before, .hero-bg::after { content: ''; position: absolute; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.14); pointer-events: none; }
.hero-bg::before { width: 520px; height: 520px; right: -180px; top: -160px; background: rgba(255, 255, 255, 0.05); }
.hero-bg::after { width: 380px; height: 380px; left: -120px; bottom: -220px; background: rgba(255, 255, 255, 0.04); }
/* เนื้อหาใน Hero ต้องอยู่เหนือวงกลมตกแต่ง (ยกเว้นแถบบนที่ fixed อยู่แล้ว) */
.hero-bg > *:not(.topbar) { position: relative; z-index: 1; }

/* ความกว้างเนื้อหากลาง: กำหนดที่เดียว ใช้กับ navbar, hero และเนื้อหาของทุก Workshop ให้ขอบซ้าย-ขวาตรงกัน
   (ชนะค่า max-width ตามขนาดจอของ Vuetify) และตัด padding ของ navbar ออก ให้โลโก้ตรงกับขอบเนื้อหา */
:root { --page-width: 1180px; }
body .v-application .container { max-width: var(--page-width); }
body .v-application .v-toolbar__content { padding-left: 0; padding-right: 0; }

/* จอกลาง (601-1311px): เว้นระยะซ้าย-ขวาของเนื้อหา ไม่ให้แถบเลือก Workshop ทับ (ใส่คลาส rail-safe ที่ container) */
@media (min-width: 601px) and (max-width: 1311px) {
  .rail-safe,
  body .v-application .container { padding-left: 76px !important; padding-right: 76px !important; }
}

/* ฉากมืดหลัง drawer ต้องอยู่เหนือแถบเลือก Workshop ด้วย (drawer ตะกร้าใช้ z-index 210) */
.v-navigation-drawer__scrim { z-index: 209 !important; }

/* มือถือ: แถบเลือกอยู่ล่างจอ จึงเว้นที่ด้านล่างไว้ไม่ให้ทับเนื้อหา และยกแจ้งเตือน (snackbar) ขึ้นเหนือแถบ */
@media (max-width: 600px) {
  .v-main { padding-bottom: 84px !important; }
  .v-snack--bottom { bottom: 84px !important; }
}
</style>
