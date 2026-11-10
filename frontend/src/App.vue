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
import WorkshopRail from '@/shell/WorkshopRail.vue'

export default {
  components: { WorkshopRail }
}
</script>

<style>
/* สไตล์ส่วนกลางที่ทุก Workshop ใช้ร่วมกัน (สไตล์เฉพาะของแต่ละ Workshop อยู่ใต้ .w1 / .w2 / .w3) */
.v-application { font-family: 'IBM Plex Sans Thai', sans-serif !important; }
.v-application.theme--light { background: #f4f2fc !important; }
.v-application .display-font { font-family: 'Kanit', sans-serif !important; }
html { scroll-behavior: smooth; }

/* จอกลาง (601-1311px): เว้นระยะซ้าย-ขวาของเนื้อหา ไม่ให้แถบเลือก Workshop ทับ (ใส่คลาส rail-safe ที่ container) */
@media (min-width: 601px) and (max-width: 1311px) {
  .rail-safe { padding-left: 76px !important; padding-right: 76px !important; }
}

/* มือถือ: แถบเลือกอยู่ล่างจอ จึงเว้นที่ด้านล่างไว้ไม่ให้ทับเนื้อหา */
@media (max-width: 600px) {
  .v-main { padding-bottom: 84px !important; }
}
</style>
