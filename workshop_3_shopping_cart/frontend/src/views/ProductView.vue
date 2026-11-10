<template>
  <v-container class="page-wrap">
    <v-btn text color="primary" class="mb-4" to="/"><v-icon left>mdi-arrow-left</v-icon>กลับไปหน้าร้าน</v-btn>

    <v-skeleton-loader v-if="loading" type="image, article, actions" class="card" />

    <v-alert v-else-if="error" type="error" text>{{ error }}</v-alert>

    <!-- รายละเอียดสินค้า: รูปซ้าย ข้อมูลขวา -->
    <v-card v-else class="card pa-6">
      <v-row>
        <v-col cols="12" md="5">
          <v-card flat class="img-box"><ProductImage :product="product" /></v-card>
        </v-col>

        <v-col cols="12" md="7">
          <h1 class="page-title">{{ product.name }}</h1>
          <div class="price big-price my-3">{{ product.price | baht }}</div>

          <!-- สถานะสต็อก -->
          <v-chip v-if="product.stock < 1" color="grey darken-3" dark small>สินค้าหมด</v-chip>
          <v-chip v-else :color="product.stock <= 5 ? 'warning' : 'success'" small text-color="white">
            <v-icon left small>mdi-package-variant-closed</v-icon>คงเหลือ {{ product.stock }} ชิ้น
          </v-chip>

          <p class="desc mt-5">{{ product.description || 'ไม่มีรายละเอียดสินค้า' }}</p>

          <v-divider class="my-5" />

          <div v-if="remaining > 0">
            <div class="d-flex align-center mb-4">
              <span class="mr-4 font-weight-medium">จำนวน</span>
              <QtyStepper v-model="qty" :max="remaining" />
              <span v-if="inCart" class="ml-4 grey--text text--darken-1 caption">มีในตะกร้า {{ inCart }} ชิ้นแล้ว</span>
            </div>
            <v-btn large depressed color="primary" class="mr-3 mb-2" @click="add(false)">
              <v-icon left>mdi-cart-plus</v-icon>ใส่ตะกร้า
            </v-btn>
            <v-btn large outlined color="primary" class="mb-2" @click="add(true)">ซื้อเลย</v-btn>
          </div>
          <v-alert v-else type="info" text dense>
            {{ product.stock < 1 ? 'สินค้านี้หมดแล้ว' : 'คุณใส่สินค้านี้ในตะกร้าครบตามสต็อกแล้ว' }}
            <v-btn v-if="product.stock >= 1" small text color="primary" to="/cart">ไปที่ตะกร้า</v-btn>
          </v-alert>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import api from '@/api'
import ProductImage from '@/components/ProductImage.vue'
import QtyStepper from '@/components/QtyStepper.vue'

export default {
  components: { ProductImage, QtyStepper },
  data () {
    return { product: null, loading: true, error: '', qty: 1 }
  },
  computed: {
    inCart () { return this.$store.getters['cart/qtyOf'](this.$route.params.id) },
    // เพิ่มได้อีกกี่ชิ้น = สต็อก - ที่อยู่ในตะกร้าแล้ว
    remaining () { return this.product ? this.product.stock - this.inCart : 0 }
  },
  async created () {
    try {
      this.product = await api.get('/products/' + this.$route.params.id)
    } catch (e) {
      this.error = e.message
    } finally {
      this.loading = false
    }
  },
  methods: {
    // goCart = true คือกด "ซื้อเลย" (เพิ่มแล้วไปหน้าตะกร้า)
    add (goCart) {
      this.$store.commit('cart/add', { product: this.product, qty: this.qty })
      this.$store.commit('notify', { text: 'เพิ่มลงตะกร้าแล้ว ' + this.qty + ' ชิ้น' })
      this.qty = 1
      if (goCart) this.$router.push('/cart')
    }
  }
}
</script>

<style scoped>
.img-box { border-radius: 18px !important; overflow: hidden; }
.big-price { font-size: 2.2rem; }
.desc { white-space: pre-line; color: #4b5563; line-height: 1.8; }
</style>
