<template>
  <!-- ตารางเกณฑ์เกรด : รับรายการเกณฑ์ (scale) และเกรดที่ได้ (active) ผ่าน props -->
  <div>
    <!-- v-for : วนสร้างแถวเกรดทีละบรรทัด -->
    <div
      v-for="item in scale"
      :key="item.grade"
      class="scale-row"
      :class="{ active: item.grade === active }"
    >
      <v-avatar size="40" :color="item.color" class="mr-4">
        <span class="scale-grade">{{ item.grade }}</span>
      </v-avatar>
      <div class="scale-range">{{ item.min }} - {{ item.max }} คะแนน</div>
      <v-spacer />
      <!-- แสดงไอคอนติ๊กเฉพาะแถวที่ตรงกับเกรดที่ได้ -->
      <v-icon v-if="item.grade === active" :color="item.color">mdi-check-circle</v-icon>
    </div>
  </div>
</template>

<script>
export default {
  // props = ค่าที่ component แม่ส่งเข้ามา
  props: {
    scale: { type: Array, required: true },
    active: { type: String, default: '' }
  }
}
</script>

<style scoped>
.scale-row {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  transition: all 0.25s ease;
}
/* แถวที่ตรงกับเกรดที่ได้ : ขยับเล็กน้อยและมีเงา */
.scale-row.active {
  border-color: #6366f1;
  background: #eef2ff;
  box-shadow: 0 8px 20px -10px rgba(79, 70, 229, 0.5);
  transform: translateX(4px);
}
.scale-grade {
  color: #fff;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.1rem;
}
.scale-range { font-weight: 500; }
</style>
