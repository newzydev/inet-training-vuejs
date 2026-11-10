<template>
  <v-container class="page-wrap rail-safe">
    <!-- เส้นทางกลับ (breadcrumb) -->
    <div class="crumbs">
      <router-link to="/workshop-3"><v-icon small>mdi-storefront-outline</v-icon> ร้านค้า</router-link>
      <v-icon small>mdi-chevron-right</v-icon>
      <span>{{ product ? product.name : '...' }}</span>
    </div>

    <v-skeleton-loader v-if="loading" type="image, article, actions" class="skeleton" />

    <v-alert v-else-if="error" type="error" text>{{ error }}</v-alert>

    <template v-else>
      <!-- รายละเอียดสินค้า: รูปซ้าย ข้อมูลขวา -->
      <v-row class="detail">
        <v-col cols="12" md="6">
          <div class="img-box"><ProductImage :product="product" /></div>
        </v-col>

        <v-col cols="12" md="6">
          <h1 class="page-title">{{ product.name }}</h1>
          <div class="price big-price my-3">{{ product.price | baht }}</div>

          <!-- สถานะสต็อก + แถบแสดงปริมาณ -->
          <div class="stock">
            <div class="d-flex align-center mb-2">
              <v-icon small :color="stockColor" class="mr-1">mdi-package-variant-closed</v-icon>
              <b :class="stockColor + '--text'">{{ stockText }}</b>
            </div>
            <v-progress-linear :value="stockPercent" :color="stockColor" height="6" rounded background-color="#ececf6" />
          </div>

          <p class="desc">{{ product.description || 'ไม่มีรายละเอียดสินค้า' }}</p>

          <!-- เลือกจำนวน + ปุ่มสั่งซื้อ -->
          <div class="buy">
            <template v-if="remaining > 0">
              <div class="d-flex align-center mb-4">
                <span class="mr-4 font-weight-medium">จำนวน</span>
                <QtyStepper v-model="qty" :max="remaining" />
                <span v-if="inCart" class="ml-4 caption grey--text text--darken-1">มีในตะกร้า {{ inCart }} ชิ้นแล้ว</span>
              </div>
              <div class="d-flex flex-wrap">
                <v-btn x-large depressed rounded color="primary" class="mr-3 mb-2" @click="add(false)">
                  <v-icon left>mdi-cart-plus</v-icon>ใส่ตะกร้า
                </v-btn>
                <v-btn x-large outlined rounded color="primary" class="mb-2" @click="add(true)">ซื้อเลย</v-btn>
              </div>
              <div class="subtotal">รวม <b class="price">{{ product.price * qty | baht }}</b></div>
            </template>
            <v-alert v-else type="info" text>
              {{ product.stock < 1 ? 'สินค้านี้หมดแล้ว' : 'คุณใส่สินค้านี้ในตะกร้าครบตามสต็อกแล้ว' }}
              <v-btn v-if="product.stock >= 1" small text color="primary" @click="$store.commit('setCartOpen', true)">เปิดตะกร้า</v-btn>
            </v-alert>
          </div>
        </v-col>
      </v-row>

      <!-- สินค้าอื่น ๆ -->
      <section v-if="related.length" class="related">
        <h2 class="display-font section-title">สินค้าอื่น ๆ ที่คุณอาจสนใจ</h2>
        <v-row>
          <v-col v-for="p in related" :key="p._id" cols="12" sm="6" md="3">
            <ProductCard :product="p" />
          </v-col>
        </v-row>
      </section>
    </template>
  </v-container>
</template>

<script>
import api from '../api'
import ProductCard from '../components/ProductCard.vue'
import ProductImage from '../components/ProductImage.vue'
import QtyStepper from '../components/QtyStepper.vue'

export default {
  components: { ProductCard, ProductImage, QtyStepper },
  data () {
    return { product: null, others: [], loading: true, error: '', qty: 1 }
  },
  computed: {
    inCart () { return this.$store.getters['cart/qtyOf'](this.$route.params.id) },
    // เพิ่มได้อีกกี่ชิ้น = สต็อก - ที่อยู่ในตะกร้าแล้ว
    remaining () { return this.product ? this.product.stock - this.inCart : 0 },
    stockColor () { return this.product.stock < 1 ? 'error' : this.product.stock <= 5 ? 'warning' : 'success' },
    stockText () { return this.product.stock < 1 ? 'สินค้าหมด' : 'คงเหลือ ' + this.product.stock + ' ชิ้น' },
    stockPercent () { return Math.min(100, this.product.stock * 4) }, // แค่ใช้ดูภาพรวม (25 ชิ้นขึ้นไป = เต็มหลอด)
    // สินค้าอื่น: เอาที่มีของก่อน แล้วเอามา 4 ชิ้น
    related () {
      return [...this.others].filter(p => p._id !== this.$route.params.id).sort((a, b) => (b.stock > 0) - (a.stock > 0)).slice(0, 4)
    }
  },
  watch: {
    // กดสินค้าอื่นจากรายการด้านล่าง: ยังเป็นหน้าเดิมแต่ id เปลี่ยน ต้องโหลดใหม่
    '$route.params.id': 'load'
  },
  created () {
    this.load()
  },
  methods: {
    async load () {
      this.loading = true
      this.error = ''
      this.qty = 1
      try {
        const [product, all] = await Promise.all([api.get('/products/' + this.$route.params.id), api.get('/products')])
        this.product = product
        this.others = all
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    // goCart = true คือกด "ซื้อเลย" (เพิ่มแล้วเปิดตะกร้า)
    add (goCart) {
      this.$store.commit('cart/add', { product: this.product, qty: this.qty })
      this.$store.commit('notify', { text: 'เพิ่มลงตะกร้าแล้ว ' + this.qty + ' ชิ้น' })
      this.qty = 1
      if (goCart) this.$store.commit('setCartOpen', true)
    }
  }
}
</script>

<style scoped>
.crumbs { display: flex; align-items: center; gap: 6px; margin-bottom: 18px; color: #6b7280; font-size: 0.9rem; }
.crumbs a { color: #4f46e5; text-decoration: none; font-weight: 500; }
.skeleton { border-radius: 24px; }

.img-box {
  border-radius: 28px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #ececf6;
  box-shadow: 0 30px 60px -32px rgba(79, 70, 229, 0.5);
}
.big-price { font-size: 2.4rem; }
.stock { max-width: 320px; margin-bottom: 18px; }
.desc { white-space: pre-line; color: #4b5563; line-height: 1.85; margin: 18px 0 24px; }

.buy {
  padding: 22px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid #ececf6;
  box-shadow: 0 16px 38px -26px rgba(79, 70, 229, 0.5);
}
.subtotal { margin-top: 6px; color: #6b7280; }
.subtotal .price { font-size: 1.3rem; margin-left: 6px; }

.related { margin-top: 56px; }
.section-title { font-size: 1.4rem; font-weight: 600; color: #1e1b4b; margin-bottom: 14px; }
</style>
