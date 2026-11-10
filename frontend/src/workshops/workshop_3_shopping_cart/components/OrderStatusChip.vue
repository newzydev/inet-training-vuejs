<template>
  <!-- ป้ายสถานะ Order: รอยืนยัน / ยืนยันแล้ว / จัดส่งแล้ว / ยกเลิก (สีและไอคอนตามสถานะ) -->
  <v-chip :small="small" :color="info.color" text-color="white" class="status-chip">
    <v-icon left x-small>{{ info.icon }}</v-icon>{{ info.text }}
  </v-chip>
</template>

<script>
import { statusOf } from '../utils/status'

export default {
  props: {
    status: { type: String, default: 'pending' },
    small: { type: Boolean, default: true }
  },
  computed: {
    info () { return statusOf(this.status) }
  }
}
</script>

<style scoped>
.status-chip { font-weight: 500; }
</style>
