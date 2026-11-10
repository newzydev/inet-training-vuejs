<template>
  <!-- การ์ดสินค้าในหน้าร้าน: กดที่การ์ดเพื่อดูรายละเอียด กดปุ่มเพื่อใส่ตะกร้า -->
  <v-card class="card product-card" :class="{ soldout: product.stock < 1 }" @click="$router.push('/product/' + product._id)">
    <div class="img-wrap">
      <ProductImage :product="product" />
      <!-- ป้ายสถานะสต็อก -->
      <v-chip v-if="product.stock < 1" small color="grey darken-3" dark class="badge">สินค้าหมด</v-chip>
      <v-chip v-else-if="product.stock <= 5" small color="warning" class="badge">เหลือ {{ product.stock }} ชิ้น</v-chip>
    </div>

    <div class="pa-4">
      <div class="name">{{ product.name }}</div>
      <div class="desc">{{ product.description || 'ไม่มีรายละเอียด' }}</div>
      <div class="d-flex align-center mt-3">
        <div class="price">{{ product.price | baht }}</div>
        <v-spacer />
        <!-- .stop = กดปุ่มแล้วไม่ให้ไปหน้ารายละเอียดด้วย -->
        <v-btn fab small depressed color="primary" :disabled="!canAdd" aria-label="ใส่ตะกร้า" @click.stop="add">
          <v-icon>mdi-cart-plus</v-icon>
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
import ProductImage from '@/components/ProductImage.vue'

export default {
  components: { ProductImage },
  props: { product: { type: Object, required: true } },
  computed: {
    // เพิ่มได้อีกหรือไม่ = สต็อกยังเหลือมากกว่าที่อยู่ในตะกร้า
    canAdd () {
      return this.product.stock - this.$store.getters['cart/qtyOf'](this.product._id) > 0
    }
  },
  methods: {
    add () {
      this.$store.commit('cart/add', { product: this.product, qty: 1 })
      this.$store.commit('notify', { text: 'เพิ่ม "' + this.product.name + '" ลงตะกร้าแล้ว' })
    }
  }
}
</script>

<style scoped>
.product-card { cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease; overflow: hidden; }
.product-card:hover { transform: translateY(-5px); box-shadow: 0 22px 44px -20px rgba(79, 70, 229, 0.5) !important; }
.product-card.soldout { opacity: 0.7; }
.img-wrap { position: relative; }
.badge { position: absolute; top: 12px; left: 12px; font-weight: 500; }
.name {
  font-weight: 600;
  font-size: 1.05rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* คำอธิบายแสดงสูงสุด 2 บรรทัด */
.desc {
  color: #6b7280;
  font-size: 0.88rem;
  min-height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.price { font-size: 1.3rem; }
</style>
