<template>
  <!-- ตัวปรับจำนวน (− 1 +) ใช้ v-model ได้: <QtyStepper v-model="qty" :max="10" /> -->
  <div class="stepper">
    <v-btn icon small :disabled="value <= min" @click="change(-1)"><v-icon small>mdi-minus</v-icon></v-btn>
    <span class="num">{{ value }}</span>
    <v-btn icon small :disabled="value >= max" @click="change(1)"><v-icon small>mdi-plus</v-icon></v-btn>
  </div>
</template>

<script>
export default {
  // v-model ของ component ใช้ prop ชื่อ value และส่ง event ชื่อ input
  props: {
    value: { type: Number, required: true },
    min: { type: Number, default: 1 },
    max: { type: Number, default: 99 }
  },
  methods: {
    change (step) {
      const next = Math.min(this.max, Math.max(this.min, this.value + step))
      if (next !== this.value) this.$emit('input', next)
    }
  }
}
</script>

<style scoped>
.stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid #e0e7ff;
  border-radius: 999px;
  background: #f5f3ff;
  padding: 2px 4px;
}
.num { min-width: 36px; text-align: center; font-weight: 600; }
</style>
