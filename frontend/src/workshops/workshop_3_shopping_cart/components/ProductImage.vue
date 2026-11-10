<template>
  <!-- รูปสินค้า: ถ้ามีรูปให้แสดงรูป ถ้าไม่มีให้แสดงพื้นไล่สีพร้อมตัวอักษรแรกของชื่อสินค้า -->
  <v-img v-if="src" :src="src" :aspect-ratio="ratio" :alt="product.name" class="product-img" />
  <div v-else class="placeholder" :style="{ background: gradient, paddingTop: 100 / ratio + '%' }">
    <span class="letter">{{ product.name ? product.name.charAt(0).toUpperCase() : '?' }}</span>
  </div>
</template>

<script>
import { imageUrl } from '../api'

// ชุดสีสำหรับพื้นหลังเมื่อไม่มีรูป (เลือกสีตามชื่อสินค้า ได้สีเดิมทุกครั้ง)
const GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#ec4899,#f97316)',
  'linear-gradient(135deg,#06b6d4,#3b82f6)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#ef4444)'
]

export default {
  props: {
    product: { type: Object, required: true },
    ratio: { type: Number, default: 1 } // อัตราส่วนกว้าง/สูง
  },
  computed: {
    src () { return imageUrl(this.product.image) },
    gradient () {
      const code = (this.product.name || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
      return GRADIENTS[code % GRADIENTS.length]
    }
  }
}
</script>

<style scoped>
.placeholder { position: relative; width: 100%; }
.letter {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-heading);
  font-size: 3.2rem;
  font-weight: 600;
}
</style>
