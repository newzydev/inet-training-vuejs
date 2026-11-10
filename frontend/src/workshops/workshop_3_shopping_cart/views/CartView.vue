<template>
  <v-container class="page-wrap rail-safe">
    <h1 class="page-title mb-1">ตะกร้าสินค้า</h1>
    <p class="page-sub mb-6">ตรวจสอบรายการก่อนสั่งซื้อ</p>

    <!-- แจ้งรายการที่สั่งไม่สำเร็จ (อยู่นอกเงื่อนไขตะกร้าว่าง เพื่อให้ยังเห็นแม้สินค้านั้นถูกนำออกจากตะกร้าแล้ว) -->
    <v-alert v-if="failed.length" type="error" text dismissible class="mb-6" @input="failed = []">
      สั่งซื้อไม่สำเร็จบางรายการ:
      <ul class="pl-4 mb-0"><li v-for="f in failed" :key="f.name">{{ f.name }} - {{ f.reason }}</li></ul>
    </v-alert>

    <!-- ตะกร้าว่าง -->
    <v-card v-if="!items.length" class="card empty pa-12">
      <v-icon size="80" color="grey lighten-1">mdi-cart-off</v-icon>
      <div class="mt-3 mb-6 grey--text">ยังไม่มีสินค้าในตะกร้า</div>
      <v-btn depressed rounded large color="primary" to="/workshop-3">ไปเลือกสินค้า</v-btn>
    </v-card>

    <v-row v-else>
      <!-- รายการในตะกร้า -->
      <v-col cols="12" md="8">
        <v-card v-for="item in items" :key="item.id" class="card item pa-4 mb-4">
          <div class="thumb"><ProductImage :product="item" /></div>

          <div class="item-info">
            <router-link :to="'/workshop-3/product/' + item.id" class="item-name">{{ item.name }}</router-link>
            <div class="grey--text text--darken-1">{{ item.price | baht }} / ชิ้น</div>
            <div class="mt-2">
              <!-- แก้จำนวนในตะกร้า (ไม่เกินสต็อก) -->
              <QtyStepper :value="item.qty" :max="item.stock" @input="setQty(item.id, $event)" />
              <span v-if="item.qty >= item.stock" class="ml-3 caption warning--text">สูงสุดตามสต็อก</span>
            </div>
          </div>

          <div class="text-right">
            <div class="price line-total">{{ item.price * item.qty | baht }}</div>
            <v-btn icon small color="error" aria-label="ลบ" @click="remove(item)"><v-icon>mdi-delete-outline</v-icon></v-btn>
          </div>
        </v-card>

        <v-btn text color="grey darken-1" @click="clearAll"><v-icon left small>mdi-trash-can-outline</v-icon>ล้างตะกร้า</v-btn>
      </v-col>

      <!-- สรุปยอด -->
      <v-col cols="12" md="4">
        <v-card class="card pa-6 summary">
          <h3 class="display-font mb-4">สรุปคำสั่งซื้อ</h3>
          <div v-for="item in items" :key="'s' + item.id" class="sum-row">
            <span class="sum-name">{{ item.name }} <span class="grey--text">x{{ item.qty }}</span></span>
            <span>{{ item.price * item.qty | baht }}</span>
          </div>
          <v-divider class="my-4" />
          <div class="d-flex justify-space-between align-center mb-5">
            <span>ยอดรวม ({{ count }} ชิ้น)</span>
            <span class="price total">{{ total | baht }}</span>
          </div>
          <v-btn block x-large depressed rounded color="primary" :loading="ordering" @click="order">
            สั่งซื้อสินค้า<v-icon right>mdi-arrow-right</v-icon>
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ProductImage from '../components/ProductImage.vue'
import QtyStepper from '../components/QtyStepper.vue'
import { checkout, refreshCart } from '../utils/checkout'

export default {
  components: { ProductImage, QtyStepper },
  data () {
    return { ordering: false, failed: [] }
  },
  computed: {
    items () { return this.$store.state.cart.items },
    count () { return this.$store.getters['cart/count'] },
    total () { return this.$store.getters['cart/total'] }
  },
  async created () {
    // เปิดหน้าตะกร้า: อัปเดตราคา/สต็อกให้ตรงกับของจริง ถ้ามีสินค้าถูกนำออกให้แจ้งผู้ใช้
    const removed = await refreshCart()
    if (removed.length) this.$store.commit('notify', { text: 'นำสินค้าที่หมดหรือไม่มีแล้วออกจากตะกร้า: ' + removed.join(', '), color: 'warning' })
  },
  methods: {
    setQty (id, qty) { this.$store.commit('cart/setQty', { id, qty }) },
    remove (item) {
      this.$store.commit('cart/remove', item.id)
      this.$store.commit('notify', { text: 'ลบ "' + item.name + '" ออกจากตะกร้าแล้ว', color: 'grey darken-2' })
    },
    clearAll () { this.$store.commit('cart/clear') },

    // สั่งซื้อ: สำเร็จทั้งหมด -> ไปดูออเดอร์, มีบางรายการไม่ผ่าน -> แจ้งเหตุผลและรีเฟรชสต็อก
    async order () {
      this.ordering = true
      this.failed = []
      const { success, failed } = await checkout()
      this.ordering = false
      if (success) this.$store.commit('notify', { text: 'สั่งซื้อสำเร็จ ' + success + ' รายการ' })
      if (!failed.length) return this.$router.push('/workshop-3/orders')
      this.failed = failed
      await refreshCart()
    }
  }
}
</script>

<style scoped>
.empty { text-align: center; }
.item { display: flex; align-items: center; gap: 20px; }
.thumb { width: 100px; flex-shrink: 0; border-radius: 16px; overflow: hidden; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-weight: 600; font-size: 1.05rem; color: #1e1b4b; text-decoration: none; }
.line-total { font-size: 1.25rem; }
.summary { position: sticky; top: 96px; }
.sum-row { display: flex; justify-content: space-between; gap: 12px; padding: 4px 0; font-size: 0.92rem; }
.sum-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.total { font-size: 1.7rem; }
@media (max-width: 600px) {
  .item { flex-wrap: wrap; }
  .thumb { width: 76px; }
}
</style>
