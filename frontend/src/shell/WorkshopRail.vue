<template>
  <!-- แถบเลือก Workshop: ลอยอยู่ด้านซ้ายตรงกลางจอ (บนมือถือจะย้ายไปอยู่ล่างกลางจอ) -->
  <nav class="rail" aria-label="เลือก Workshop">
    <!-- v-for วนสร้างปุ่มจากรายการ workshops; v-tooltip แสดงชื่อเมื่อเอาเมาส์ชี้ -->
    <v-tooltip v-for="w in workshops" :key="w.id" :right="!$vuetify.breakpoint.xs" :top="$vuetify.breakpoint.xs" open-delay="150">
      <template v-slot:activator="{ on, attrs }">
        <!-- :to = ลิงก์ไปหน้านั้น, ปุ่มจะเป็นสี "active" เองเมื่ออยู่ในหน้านั้น (รวมหน้าย่อย) -->
        <v-btn fab depressed :to="w.to" class="rail-btn" :aria-label="'Workshop ' + w.id" v-bind="attrs" v-on="on">
          <v-icon>{{ w.icon }}</v-icon>
          <span class="num">{{ w.id }}</span>
        </v-btn>
      </template>
      <span>Workshop {{ w.id }} · {{ w.brand }}</span>
    </v-tooltip>
  </nav>
</template>

<script>
import { workshops } from '@/workshops'

export default {
  data () {
    return { workshops }
  }
}
</script>

<style scoped>
.rail {
  position: fixed;
  z-index: 100;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(99, 102, 241, 0.18);
  box-shadow: 0 18px 40px -16px rgba(30, 27, 110, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.rail-btn {
  position: relative;
  width: 46px !important;
  height: 46px !important;
  background: transparent !important;
  color: #6366f1 !important;
  transition: transform 0.2s ease;
}
.rail-btn:hover { transform: scale(1.08); }
/* ปุ่มของ Workshop ที่เปิดอยู่: พื้นไล่สี + ไอคอนสีขาว */
.rail-btn.v-btn--active {
  background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
  color: #fff !important;
  box-shadow: 0 8px 18px -6px rgba(79, 70, 229, 0.7) !important;
}
.rail-btn.v-btn--active::before { opacity: 0; } /* ปิดเงาซ้อนของ Vuetify */
.num {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #ec4899;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
}

/* มือถือ: ย้ายไปอยู่ล่างกลางจอ แนวนอน */
@media (max-width: 600px) {
  .rail {
    left: 50%;
    top: auto;
    bottom: 14px;
    transform: translateX(-50%);
    flex-direction: row;
  }
}
</style>
