<template>
  <div>
    <v-alert v-if="error" type="error" text>
      {{ error }}
      <template v-slot:append><v-btn small text color="error" @click="load">ลองใหม่</v-btn></template>
    </v-alert>

    <v-skeleton-loader v-if="loading" type="card, card" class="skeleton" />

    <template v-else-if="stats">
      <!-- มีผู้สมัครรออนุมัติ: เตือนให้ไปอนุมัติ -->
      <v-alert v-if="stats.users.pending" type="warning" text prominent border="left" class="mb-6">
        มีผู้สมัครใหม่รออนุมัติ <b>{{ stats.users.pending }}</b> คน
        <template v-slot:append><v-btn depressed rounded small color="warning" to="/workshop-3/admin/users">ไปอนุมัติ</v-btn></template>
      </v-alert>

      <!-- การ์ดสรุป -->
      <v-row>
        <v-col v-for="c in cards" :key="c.label" cols="12" sm="6" md="3">
          <v-card class="card stat pa-5">
            <v-avatar size="46" :color="c.color" class="mb-3"><v-icon color="white">{{ c.icon }}</v-icon></v-avatar>
            <div class="grey--text text--darken-1 caption">{{ c.label }}</div>
            <div class="value">{{ c.value }}</div>
            <div class="sub">{{ c.sub }}</div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-1">
        <!-- ยอดขาย 7 วัน -->
        <v-col cols="12" md="8">
          <v-card class="card pa-6 h-100">
            <div class="d-flex align-center mb-4">
              <h3 class="display-font">ยอดขาย 7 วันล่าสุด</h3>
              <v-spacer />
              <span class="grey--text caption">รวม {{ weekTotal | baht }} · {{ weekCount }} ออเดอร์</span>
            </div>
            <div class="chart">
              <div v-for="d in stats.sales7d" :key="d.date" class="bar-col" :title="dayLabel(d.date, true) + ': ' + d.amount + ' บาท (' + d.count + ' ออเดอร์)'">
                <div class="bar-amount">{{ d.amount ? short(d.amount) : '' }}</div>
                <div class="bar-track"><div class="bar" :style="{ height: barHeight(d.amount) }"></div></div>
                <div class="bar-day" :class="{ today: isToday(d.date) }">{{ dayLabel(d.date) }}</div>
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- สถานะออเดอร์ -->
        <v-col cols="12" md="4">
          <v-card class="card pa-6 h-100">
            <h3 class="display-font mb-4">สถานะออเดอร์</h3>
            <div v-if="stats.orders.total" class="split">
              <span v-for="s in statusRows" :key="s.value" class="seg" :class="s.color" :style="{ flex: s.count }"></span>
            </div>
            <div v-for="s in statusRows" :key="s.value" class="status-row">
              <span class="dot" :class="s.color"></span>
              <span class="flex-grow-1">{{ s.text }}</span>
              <b>{{ s.count }}</b>
            </div>
            <router-link to="/workshop-3/admin/orders" class="more">จัดการออเดอร์ <v-icon x-small color="primary">mdi-arrow-right</v-icon></router-link>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-1">
        <!-- สินค้าขายดี -->
        <v-col cols="12" md="4">
          <v-card class="card pa-6 h-100">
            <h3 class="display-font mb-3">สินค้าขายดี</h3>
            <div v-if="!stats.topProducts.length" class="grey--text">ยังไม่มียอดขาย</div>
            <div v-for="(p, i) in stats.topProducts" :key="p._id" class="row-item">
              <span class="rank">{{ i + 1 }}</span>
              <div class="mini"><ProductImage :product="{ name: p.name || '?', image: p.image }" /></div>
              <div class="grow">
                <div class="name">{{ p.name || 'สินค้าถูกลบแล้ว' }}</div>
                <div class="muted">ขายแล้ว {{ p.quantity }} ชิ้น</div>
              </div>
              <b class="price">{{ p.revenue | baht }}</b>
            </div>
          </v-card>
        </v-col>

        <!-- สินค้าใกล้หมด -->
        <v-col cols="12" md="4">
          <v-card class="card pa-6 h-100">
            <h3 class="display-font mb-3">สินค้าใกล้หมด</h3>
            <div v-if="!stats.lowStock.length" class="grey--text">สต็อกทุกรายการเพียงพอ</div>
            <div v-for="p in stats.lowStock" :key="p._id" class="row-item">
              <div class="mini"><ProductImage :product="p" /></div>
              <div class="grow">
                <div class="name">{{ p.name }}</div>
                <div class="muted">{{ p.price | baht }}</div>
              </div>
              <v-chip x-small :color="p.stock < 1 ? 'error' : 'warning'" text-color="white">{{ p.stock < 1 ? 'หมด' : 'เหลือ ' + p.stock }}</v-chip>
            </div>
            <router-link to="/workshop-3/admin/products" class="more">จัดการสินค้า <v-icon x-small color="primary">mdi-arrow-right</v-icon></router-link>
          </v-card>
        </v-col>

        <!-- ออเดอร์ล่าสุด -->
        <v-col cols="12" md="4">
          <v-card class="card pa-6 h-100">
            <h3 class="display-font mb-3">ออเดอร์ล่าสุด</h3>
            <div v-if="!stats.recentOrders.length" class="grey--text">ยังไม่มีออเดอร์</div>
            <div v-for="o in stats.recentOrders" :key="o._id" class="row-item">
              <div class="grow">
                <div class="name">{{ o.product ? o.product.name : 'สินค้าถูกลบแล้ว' }} <span class="muted">x{{ o.quantity }}</span></div>
                <div class="muted">{{ o.user ? o.user.name : '-' }} · {{ o.createdAt | dateTime }}</div>
              </div>
              <div class="text-right">
                <div class="price">{{ o.totalPrice | baht }}</div>
                <OrderStatusChip :status="o.status" />
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
import api from '../../api'
import { baht } from '../../utils/format'
import { ORDER_STATUS } from '../../utils/status'
import OrderStatusChip from '../../components/OrderStatusChip.vue'
import ProductImage from '../../components/ProductImage.vue'

export default {
  components: { OrderStatusChip, ProductImage },
  data () {
    return { stats: null, loading: true, error: '' }
  },
  computed: {
    // การ์ดสรุป 4 ใบด้านบน
    cards () {
      const s = this.stats
      return [
        { label: 'ยอดขายรวม', value: baht(s.orders.revenue), sub: 'ไม่นับออเดอร์ที่ยกเลิก', icon: 'mdi-cash-multiple', color: 'success' },
        { label: 'ออเดอร์ทั้งหมด', value: s.orders.total, sub: 'รอยืนยัน ' + s.orders.byStatus.pending.count + ' · ยืนยันแล้ว ' + s.orders.byStatus.confirmed.count, icon: 'mdi-receipt-text', color: 'primary' },
        { label: 'สินค้า', value: s.products.total, sub: 'หมด ' + s.products.outOfStock + ' · เหลือน้อย ' + s.products.lowStock, icon: 'mdi-package-variant-closed', color: 'accent' },
        { label: 'ผู้ใช้', value: s.users.total, sub: 'รออนุมัติ ' + s.users.pending + ' · ผู้ดูแล ' + s.users.admins, icon: 'mdi-account-group', color: 'secondary' }
      ]
    },
    statusRows () {
      return Object.values(ORDER_STATUS).map(s => ({ ...s, count: this.stats.orders.byStatus[s.value].count }))
    },
    weekTotal () { return this.stats.sales7d.reduce((s, d) => s + d.amount, 0) },
    weekCount () { return this.stats.sales7d.reduce((s, d) => s + d.count, 0) },
    maxAmount () { return Math.max(...this.stats.sales7d.map(d => d.amount), 1) }
  },
  created () {
    this.load()
  },
  methods: {
    async load () {
      this.loading = true
      this.error = ''
      try {
        this.stats = await api.get('/stats')
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    // ความสูงของแท่งกราฟ (วันที่ไม่มียอดแสดงเป็นแท่งเตี้ย ๆ )
    barHeight (amount) { return amount ? Math.max(8, (amount / this.maxAmount) * 100) + '%' : '3px' },
    short (n) { return n >= 1000 ? (n / 1000).toFixed(n % 1000 ? 1 : 0) + 'k' : n },
    dayLabel (date, full) {
      return new Date(date + 'T00:00:00').toLocaleDateString('th-TH', full ? { weekday: 'long', day: 'numeric', month: 'short' } : { weekday: 'short' })
    },
    isToday (date) { return date === new Date().toLocaleDateString('en-CA') }
  }
}
</script>

<style scoped>
.skeleton { border-radius: 22px; }
.h-100 { height: 100%; }
.stat .value { font-family: 'Kanit', sans-serif; font-size: 1.9rem; font-weight: 600; color: #1e1b4b; line-height: 1.2; }
.stat .sub { font-size: 0.8rem; color: #9ca3af; margin-top: 2px; }

/* กราฟแท่งยอดขายรายวัน */
.chart { display: flex; gap: 10px; align-items: stretch; height: 220px; }
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; min-width: 0; }
.bar-amount { height: 18px; font-size: 0.72rem; color: #6b7280; }
.bar-track { flex: 1; width: 100%; max-width: 56px; display: flex; align-items: flex-end; background: #f5f5fb; border-radius: 14px; overflow: hidden; }
.bar { width: 100%; border-radius: 14px; background: linear-gradient(180deg, #8b5cf6, #4f46e5); transition: height 0.6s ease; }
.bar-day { margin-top: 8px; font-size: 0.78rem; color: #9ca3af; }
.bar-day.today { color: #4f46e5; font-weight: 600; }

/* สถานะออเดอร์ */
.split { display: flex; height: 12px; border-radius: 8px; overflow: hidden; gap: 2px; margin-bottom: 18px; }
.seg.warning, .dot.warning { background: #fb8c00; }
.seg.info, .dot.info { background: #2196f3; }
.seg.success, .dot.success { background: #4caf50; }
.seg.error, .dot.error { background: #ef4444; }
.status-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.more { display: inline-block; margin-top: 12px; font-size: 0.88rem; font-weight: 500; color: #4f46e5; text-decoration: none; }

/* รายการสั้น ๆ */
.row-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid #f1f0f9; }
.row-item:first-of-type { border-top: 0; }
.rank { width: 22px; height: 22px; border-radius: 50%; background: #eef2ff; color: #4f46e5; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mini { width: 44px; height: 44px; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
.grow { flex: 1; min-width: 0; }
.name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.muted { color: #9ca3af; font-size: 0.78rem; }
</style>
