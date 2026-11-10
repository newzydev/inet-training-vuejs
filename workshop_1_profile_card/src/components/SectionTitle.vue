<template>
  <!-- หัวข้อของแต่ละ section : ส่ง label (ตัวเล็กด้านบน) และ title (ตัวใหญ่) เข้ามาทาง props -->
  <div class="section-title text-center">
    <div class="label">{{ label }}</div>
    <!-- ไม่ใช้ชื่อคลาส "title" เพราะ Vuetify มีสไตล์ .title บังคับฟอนต์ Roboto ไว้ -->
    <h2 class="heading">{{ title }}</h2>
    <div class="bar"></div>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String, default: '' },
    title: { type: String, required: true }
  }
}
</script>

<style scoped>
.section-title { margin-bottom: 48px; }
.label {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #7c3aed;
}
.heading {
  margin-top: 4px;
  font-family: 'Kanit', sans-serif;
  font-size: 2.1rem;
  font-weight: 600;
}
/* ขีดไล่สีใต้หัวข้อ */
.bar {
  width: 56px;
  height: 4px;
  margin: 14px auto 0;
  border-radius: 4px;
  background: linear-gradient(90deg, #4f46e5, #ec4899);
}
</style>
