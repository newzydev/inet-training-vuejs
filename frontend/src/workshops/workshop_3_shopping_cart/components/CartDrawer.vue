<template>
  <!-- ตะกร้าแบบ drawer ด้านขวา: เปิดจากไอคอนตะกร้าบนแถบเมนู ดู/แก้จำนวน/สั่งซื้อได้โดยไม่ต้องเปลี่ยนหน้า -->
  <v-navigation-drawer v-model="open" right temporary fixed width="420" class="cart-drawer">
    <div class="head">
      <div>
        <div class="title">ตะกร้าของคุณ</div>
        <div class="caption grey--text">{{ count }} ชิ้น</div>
      </div>
      <v-btn icon aria-label="ปิด" @click="open = false"><v-icon>mdi-close</v-icon></v-btn>
    </div>

    <!-- แจ้งรายการที่สั่งไม่สำเร็จ -->
    <v-alert v-if="failed.length" type="error" text dense dismissible class="mx-4" @input="failed = []">
      สั่งซื้อไม่สำเร็จบางรายการ:
      <ul class="pl-4 mb-0"><li v-for="f in failed" :key="f.name">{{ f.name }} - {{ f.reason }}</li></ul>
    </v-alert>

    <!-- ตะกร้าว่าง -->
    <div v-if="!items.length" class="empty">
      <v-icon size="64" color="grey lighten-1">mdi-cart-outline</v-icon>
      <div class="mt-3 mb-4 grey--text">ยังไม่มีสินค้าในตะกร้า</div>
      <v-btn depressed color="primary" rounded to="/workshop-3" @click="open = false">เลือกสินค้า</v-btn>
    </div>

    <!-- รายการสินค้า -->
    <div v-for="item in items" :key="item.id" class="item">
      <div class="thumb"><ProductImage :product="item" /></div>
      <div class="item-info">
        <router-link :to="'/workshop-3/product/' + item.id" class="item-name" @click.native="open = false">{{ item.name }}</router-link>
        <div class="unit">{{ item.price | baht }} / ชิ้น</div>
        <div class="d-flex align-center mt-2">
          <QtyStepper :value="item.qty" :max="item.stock" @input="setQty(item.id, $event)" />
          <v-spacer />
          <b class="line">{{ item.price * item.qty | baht }}</b>
        </div>
      </div>
      <v-btn icon x-small class="remove" aria-label="ลบ" @click="remove(item)"><v-icon small>mdi-close</v-icon></v-btn>
    </div>

    <!-- ส่วนล่างสุด: ยอดรวมและปุ่มสั่งซื้อ (ติดอยู่ล่างเสมอ) -->
    <template v-slot:append>
      <div v-if="items.length" class="foot">
        <div class="d-flex justify-space-between align-center mb-3">
          <span class="grey--text text--darken-1">ยอดรวม</span>
          <span class="total">{{ total | baht }}</span>
        </div>
        <v-btn block large depressed rounded color="primary" :loading="ordering" @click="order">
          สั่งซื้อสินค้า<v-icon right>mdi-arrow-right</v-icon>
        </v-btn>
        <v-btn block text small class="mt-2" to="/workshop-3/cart" @click="open = false">ดูตะกร้าเต็มหน้า</v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import ProductImage from './ProductImage.vue'
import QtyStepper from './QtyStepper.vue'
import { checkout, refreshCart } from '../utils/checkout'

export default {
  components: { ProductImage, QtyStepper },
  data () {
    return { ordering: false, failed: [] }
  },
  computed: {
    // เปิด/ปิด drawer ผูกกับ store (ไอคอนตะกร้าบนแถบเมนูสั่งเปิดผ่าน store)
    open: {
      get () { return this.$store.state.cartOpen },
      set (v) { this.$store.commit('setCartOpen', v) }
    },
    items () { return this.$store.state.cart.items },
    count () { return this.$store.getters['cart/count'] },
    total () { return this.$store.getters['cart/total'] }
  },
  watch: {
    // เปิด drawer ทุกครั้ง: เทียบกับสต็อก/ราคาจริง ถ้ามีสินค้าถูกนำออกให้แจ้งผู้ใช้
    async open (isOpen) {
      if (!isOpen) return
      this.failed = []
      const removed = await refreshCart()
      if (removed.length) this.$store.commit('notify', { text: 'นำสินค้าที่หมดหรือไม่มีแล้วออกจากตะกร้า: ' + removed.join(', '), color: 'warning' })
    }
  },
  methods: {
    setQty (id, qty) { this.$store.commit('cart/setQty', { id, qty }) },
    remove (item) {
      this.$store.commit('cart/remove', item.id)
      this.$store.commit('notify', { text: 'ลบ "' + item.name + '" ออกจากตะกร้าแล้ว', color: 'grey darken-2' })
    },

    // สั่งซื้อ: สำเร็จทั้งหมด -> ปิด drawer แล้วไปหน้าออเดอร์, มีบางรายการไม่ผ่าน -> แจ้งเหตุผลใน drawer
    async order () {
      this.ordering = true
      this.failed = []
      const { success, failed } = await checkout()
      this.ordering = false
      if (success) this.$store.commit('notify', { text: 'สั่งซื้อสำเร็จ ' + success + ' รายการ' })
      if (!failed.length) {
        this.open = false
        return this.$router.push('/workshop-3/orders').catch(() => {})
      }
      this.failed = failed
      await refreshCart()
    }
  }
}
</script>

<style scoped>
/* ให้ drawer อยู่เหนือแถบเลือก Workshop (ที่ลอยอยู่ล่างจอบนมือถือ) ไม่งั้นแถบจะทับปุ่มสั่งซื้อ */
.cart-drawer { max-width: 100vw; z-index: 210 !important; }
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 12px;
}
.title { font-family: 'Kanit', sans-serif; font-size: 1.4rem; font-weight: 600; color: #1e1b4b; }
.empty { text-align: center; padding: 72px 24px; }

.item { display: flex; gap: 14px; padding: 14px 20px; border-top: 1px solid #f1f0f9; position: relative; }
.thumb { width: 76px; height: 76px; flex-shrink: 0; border-radius: 14px; overflow: hidden; }
.item-info { flex: 1; min-width: 0; padding-right: 18px; }
.item-name { display: block; font-weight: 600; color: #1e1b4b; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.unit { font-size: 0.82rem; color: #9ca3af; }
.line { font-family: 'Kanit', sans-serif; color: #4f46e5; }
.remove { position: absolute !important; top: 12px; right: 14px; color: #9ca3af !important; }

.foot { padding: 18px 20px 22px; border-top: 1px solid #ececf6; background: #fff; }
.total { font-family: 'Kanit', sans-serif; font-size: 1.7rem; font-weight: 600; color: #4f46e5; }
</style>
