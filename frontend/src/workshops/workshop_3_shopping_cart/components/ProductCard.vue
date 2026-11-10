<template>
  <!-- การ์ดสินค้าในหน้าร้าน: กดที่การ์ดเพื่อดูรายละเอียด / กดปุ่มกลมเพื่อใส่ตะกร้าทันที -->
  <v-card class="product-card" :class="{ soldout: product.stock < 1 }" flat @click="$router.push('/workshop-3/product/' + product._id)">
    <div class="img-wrap">
      <ProductImage :product="product" />

      <!-- ป้ายมุมซ้ายบน: สถานะสต็อก -->
      <v-chip v-if="product.stock < 1" small color="grey darken-3" dark class="badge">สินค้าหมด</v-chip>
      <v-chip v-else-if="product.stock <= 5" small color="warning" class="badge">เหลือ {{ product.stock }} ชิ้น</v-chip>

      <!-- ป้ายมุมขวาบน: จำนวนที่อยู่ในตะกร้าแล้ว -->
      <v-chip v-if="inCart" small color="primary" dark class="in-cart"><v-icon left x-small>mdi-cart</v-icon>{{ inCart }}</v-chip>

      <!-- ปุ่มใส่ตะกร้า: .stop = กดแล้วไม่ไปหน้ารายละเอียดด้วย -->
      <v-btn fab small depressed color="primary" class="quick-add" :disabled="!canAdd" aria-label="ใส่ตะกร้า" @click.stop="add">
        <v-icon>mdi-cart-plus</v-icon>
      </v-btn>
    </div>

    <div class="body">
      <div class="name">{{ product.name }}</div>
      <div class="desc">{{ product.description || 'ไม่มีรายละเอียด' }}</div>
      <div class="d-flex align-center mt-3">
        <div class="price">{{ product.price | baht }}</div>
        <v-spacer />
        <span v-if="product.stock > 5" class="stock-text">คงเหลือ {{ product.stock }}</span>
      </div>
    </div>
  </v-card>
</template>

<script>
import ProductImage from './ProductImage.vue'

export default {
  components: { ProductImage },
  props: { product: { type: Object, required: true } },
  computed: {
    inCart () { return this.$store.getters['cart/qtyOf'](this.product._id) },
    // เพิ่มได้อีกหรือไม่ = สต็อกยังเหลือมากกว่าที่อยู่ในตะกร้า
    canAdd () { return this.product.stock - this.inCart > 0 }
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
.product-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 22px !important;
  border: 1px solid #ececf6 !important;
  background: #fff !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 50px -22px rgba(79, 70, 229, 0.55) !important;
}
.product-card.soldout { opacity: 0.72; }

.img-wrap { position: relative; overflow: hidden; }
/* รูปขยายเล็กน้อยเมื่อเอาเมาส์ชี้ */
.img-wrap >>> .v-image, .img-wrap >>> .placeholder { transition: transform 0.5s ease; }
.product-card:hover .img-wrap >>> .v-image,
.product-card:hover .img-wrap >>> .placeholder { transform: scale(1.06); }

.badge { position: absolute; top: 12px; left: 12px; font-weight: 500; }
.in-cart { position: absolute; top: 12px; right: 12px; font-weight: 600; }

/* ปุ่มใส่ตะกร้า: ซ่อนไว้ แล้วเลื่อนขึ้นมาเมื่อเอาเมาส์ชี้การ์ด (บนจอสัมผัสแสดงตลอด) */
.quick-add {
  position: absolute !important;
  right: 14px;
  bottom: 14px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  box-shadow: 0 10px 22px -6px rgba(79, 70, 229, 0.7) !important;
}
.product-card:hover .quick-add,
.quick-add:focus { opacity: 1; transform: translateY(0); }
@media (hover: none) { .quick-add { opacity: 1; transform: none; } }

.body { padding: 16px 18px 18px; }
.name { font-weight: 600; font-size: 1.05rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.desc {
  color: #6b7280;
  font-size: 0.86rem;
  min-height: 2.6em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.price { font-family: var(--font-heading); font-size: 1.35rem; font-weight: 600; color: #4f46e5; }
.stock-text { font-size: 0.78rem; color: #9ca3af; }
</style>
