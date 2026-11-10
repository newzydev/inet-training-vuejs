<template>
  <v-container class="page-wrap rail-safe">
    <h1 class="page-title mb-1">ออเดอร์ของฉัน</h1>
    <p class="page-sub mb-6">ติดตามสถานะการสั่งซื้อของคุณ</p>

    <!-- สรุปตัวเลข -->
    <v-row class="mb-2">
      <v-col v-for="s in stats" :key="s.label" cols="12" sm="4">
        <v-card class="card pa-5 d-flex align-center">
          <v-avatar size="48" :color="s.color" class="mr-4"><v-icon color="white">{{ s.icon }}</v-icon></v-avatar>
          <div>
            <div class="grey--text text--darken-1 caption">{{ s.label }}</div>
            <div class="stat-value">{{ s.value }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" text>
      {{ error }}
      <template v-slot:append><v-btn small text color="error" @click="load">ลองใหม่</v-btn></template>
    </v-alert>

    <!-- ตัวกรองตามสถานะ -->
    <v-chip-group v-model="filter" mandatory active-class="primary white--text" class="my-3">
      <v-chip v-for="f in filters" :key="f.value" :value="f.value" label>{{ f.text }} <span class="ml-1 opacity">{{ countOf(f.value) }}</span></v-chip>
    </v-chip-group>

    <v-skeleton-loader v-if="loading" type="list-item-avatar-three-line, list-item-avatar-three-line" class="skeleton" />

    <!-- ยังไม่มีออเดอร์ -->
    <v-card v-else-if="!shown.length" class="card empty pa-12">
      <v-icon size="72" color="grey lighten-1">mdi-receipt-text-outline</v-icon>
      <div class="mt-3 mb-5 grey--text">{{ orders.length ? 'ไม่มีออเดอร์ในสถานะนี้' : 'ยังไม่มีออเดอร์' }}</div>
      <v-btn depressed rounded color="primary" to="/workshop-3">เริ่มเลือกสินค้า</v-btn>
    </v-card>

    <!-- รายการออเดอร์ -->
    <v-card v-for="o in shown" :key="o._id" class="card order pa-4 mb-4">
      <div class="o-img"><ProductImage :product="o.product || { name: '?' }" /></div>

      <div class="o-main">
        <div class="d-flex align-center flex-wrap">
          <router-link v-if="o.product" :to="'/workshop-3/product/' + o.product._id" class="o-name">{{ o.product.name }}</router-link>
          <span v-else class="o-name grey--text">สินค้าถูกลบแล้ว</span>
          <v-spacer />
          <OrderStatusChip :status="o.status" />
        </div>
        <div class="meta">#{{ o._id.slice(-6).toUpperCase() }} · {{ o.createdAt | dateTime }}</div>
        <div class="calc">{{ o.quantity }} × {{ o.unitPrice | baht }} = <b class="price">{{ o.totalPrice | baht }}</b></div>

        <!-- ขั้นตอนของออเดอร์ (ที่ยกเลิกแล้วแสดงข้อความแทน) -->
        <div v-if="statusOf(o.status).step >= 0" class="steps">
          <div v-for="(label, i) in stepLabels" :key="label" class="step" :class="{ done: i <= statusOf(o.status).step }">
            <span class="dot"></span><span class="label">{{ label }}</span>
          </div>
        </div>
        <div v-else class="cancelled-note"><v-icon x-small color="error">mdi-information-outline</v-icon> ออเดอร์นี้ถูกยกเลิกแล้ว สต็อกถูกคืนให้สินค้าเรียบร้อย</div>
      </div>

      <div v-if="canCancel(o.status)" class="o-action">
        <v-btn small outlined rounded color="error" @click="askCancel(o)">ยกเลิกออเดอร์</v-btn>
      </div>
    </v-card>

    <!-- ป๊อปอัปยืนยันการยกเลิก -->
    <v-dialog v-model="cancelOpen" max-width="420">
      <v-card class="pa-2 dialog-card">
        <v-card-title class="dialog-title">ยกเลิกออเดอร์นี้?</v-card-title>
        <v-card-text>
          ยกเลิกออเดอร์ <b>{{ target && target.product ? target.product.name : '' }}</b> จำนวน {{ target && target.quantity }} ชิ้น
          ระบบจะคืนสินค้ากลับเข้าสต็อก และไม่สามารถย้อนกลับได้
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text :disabled="cancelling" @click="cancelOpen = false">ไม่ยกเลิก</v-btn>
          <v-btn depressed rounded color="error" :loading="cancelling" @click="cancel">ยืนยันยกเลิก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from '../api'
import { baht } from '../utils/format'
import { ORDER_STATUS, statusOf, canCancel } from '../utils/status'
import OrderStatusChip from '../components/OrderStatusChip.vue'
import ProductImage from '../components/ProductImage.vue'

export default {
  components: { OrderStatusChip, ProductImage },
  data () {
    return {
      orders: [],
      loading: true,
      error: '',
      filter: 'all',
      stepLabels: ['สั่งซื้อแล้ว', 'ยืนยันแล้ว', 'จัดส่งแล้ว'],
      cancelOpen: false,
      target: null,
      cancelling: false
    }
  },
  computed: {
    filters () {
      return [{ text: 'ทั้งหมด', value: 'all' }, ...Object.values(ORDER_STATUS).map(s => ({ text: s.text, value: s.value }))]
    },
    shown () {
      return this.filter === 'all' ? this.orders : this.orders.filter(o => statusOf(o.status).value === this.filter)
    },
    stats () {
      const live = this.orders.filter(o => statusOf(o.status).value !== 'cancelled') // ไม่นับที่ยกเลิก
      return [
        { label: 'ออเดอร์ทั้งหมด', value: this.orders.length, icon: 'mdi-receipt-text', color: 'primary' },
        { label: 'กำลังดำเนินการ', value: this.orders.filter(o => ['pending', 'confirmed'].includes(statusOf(o.status).value)).length, icon: 'mdi-timer-sand', color: 'warning' },
        { label: 'ยอดสั่งซื้อรวม', value: baht(live.reduce((s, o) => s + o.totalPrice, 0)), icon: 'mdi-cash-multiple', color: 'success' }
      ]
    }
  },
  created () {
    this.load()
  },
  methods: {
    statusOf,
    canCancel,
    countOf (value) {
      return value === 'all' ? this.orders.length : this.orders.filter(o => statusOf(o.status).value === value).length
    },
    async load () {
      this.loading = true
      this.error = ''
      try {
        this.orders = await api.get('/orders/me') // backend ส่งเฉพาะออเดอร์ของเราให้แล้ว
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    askCancel (order) {
      this.target = order
      this.cancelOpen = true
    },
    async cancel () {
      this.cancelling = true
      try {
        await api.put('/orders/' + this.target._id + '/cancel')
        this.$store.commit('notify', { text: 'ยกเลิกออเดอร์แล้ว สต็อกถูกคืนเรียบร้อย' })
        this.cancelOpen = false
        await this.load()
      } catch (e) {
        this.$store.commit('notify', { text: e.message, color: 'error' })
        this.cancelOpen = false
        await this.load()
      } finally {
        this.cancelling = false
      }
    }
  }
}
</script>

<style scoped>
.stat-value { font-family: 'Kanit', sans-serif; font-size: 1.5rem; font-weight: 600; }
.skeleton, .empty { border-radius: 22px; text-align: center; }
.opacity { opacity: 0.6; }

.order { display: flex; gap: 18px; align-items: flex-start; }
.o-img { width: 96px; flex-shrink: 0; border-radius: 16px; overflow: hidden; }
.o-main { flex: 1; min-width: 0; }
.o-name { font-weight: 600; font-size: 1.1rem; color: #1e1b4b; text-decoration: none; margin-right: 12px; }
.meta { color: #9ca3af; font-size: 0.82rem; margin: 2px 0 6px; }
.calc { color: #4b5563; }
.calc .price { font-size: 1.15rem; margin-left: 4px; }
.o-action { align-self: center; }

/* ขั้นตอนสถานะ: จุด 3 จุดเรียงกัน จุดที่ผ่านแล้วเป็นสีม่วง */
.steps { display: flex; margin-top: 14px; max-width: 420px; }
.step { flex: 1; position: relative; text-align: center; font-size: 0.76rem; color: #b4b4c8; }
.step::before { content: ''; position: absolute; top: 5px; left: -50%; width: 100%; height: 2px; background: #e5e7eb; }
.step:first-child::before { display: none; }
.dot { position: relative; z-index: 1; display: block; width: 12px; height: 12px; margin: 0 auto 5px; border-radius: 50%; background: #e5e7eb; }
.step.done { color: #4f46e5; font-weight: 500; }
.step.done .dot { background: linear-gradient(135deg, #4f46e5, #7c3aed); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.18); }
.step.done::before { background: #6366f1; }
.cancelled-note { margin-top: 12px; font-size: 0.85rem; color: #6b7280; }

.dialog-card { border-radius: 22px !important; }
.dialog-title { font-family: 'Kanit', sans-serif; }

@media (max-width: 600px) {
  .order { flex-wrap: wrap; }
  .o-img { width: 72px; }
  .o-action { width: 100%; }
}
</style>
