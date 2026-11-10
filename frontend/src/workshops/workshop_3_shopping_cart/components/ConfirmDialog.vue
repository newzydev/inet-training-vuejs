<template>
  <!-- ป๊อปอัปยืนยันการกระทำที่ย้อนกลับไม่ได้ (ลบ / ยกเลิก / ระงับ): ใช้ร่วมกันหลายหน้า
       ใช้ v-model เปิด/ปิด, ใส่ข้อความใน slot, ฟัง event @confirm -->
  <v-dialog :value="value" max-width="420" @input="$emit('input', $event)">
    <v-card class="confirm">
      <div class="icon-wrap" :class="color">
        <v-icon color="white">{{ icon }}</v-icon>
      </div>
      <v-card-title class="confirm-title">{{ title }}</v-card-title>
      <v-card-text class="text"><slot></slot></v-card-text>
      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn text :disabled="loading" @click="$emit('input', false)">ไม่ใช่</v-btn>
        <v-btn depressed rounded :color="color" :loading="loading" @click="$emit('confirm')">{{ confirmText }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: { type: Boolean, default: false },
    title: { type: String, default: 'ยืนยันการทำรายการ?' },
    confirmText: { type: String, default: 'ยืนยัน' },
    color: { type: String, default: 'error' },
    icon: { type: String, default: 'mdi-alert-outline' },
    loading: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.confirm { text-align: center; padding-top: 28px; border-radius: 24px !important; }
.icon-wrap {
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-wrap.error { background: #ef4444; box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.15); }
.icon-wrap.primary { background: #5b3df5; box-shadow: 0 0 0 8px rgba(91, 61, 245, 0.15); }
.icon-wrap.warning { background: #fb8c00; box-shadow: 0 0 0 8px rgba(251, 140, 0, 0.15); }
.confirm-title { justify-content: center; font-family: var(--font-heading); font-size: 1.3rem; }
.text { color: #4b5563; }
</style>
