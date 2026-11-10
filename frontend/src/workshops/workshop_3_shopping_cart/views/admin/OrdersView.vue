<template>
  <div>
    <v-alert v-if="error" type="error" text>
      {{ error }}
      <template v-slot:append><v-btn small text color="error" @click="load">ลองใหม่</v-btn></template>
    </v-alert>

    <!-- ตัวกรองตามสถานะ (มีจำนวนกำกับ) -->
    <v-chip-group v-model="filter" mandatory active-class="primary white--text" class="mb-3">
      <v-chip v-for="f in filters" :key="f.value" :value="f.value" label>{{ f.text }} <span class="ml-1 opacity">{{ countOf(f.value) }}</span></v-chip>
    </v-chip-group>

    <v-card class="card pa-2">
      <div class="bar">
        <v-text-field v-model="search" placeholder="ค้นหาสินค้า / ผู้สั่ง / เลขออเดอร์..." prepend-inner-icon="mdi-magnify" hide-details outlined dense rounded clearable class="search" />
        <v-spacer />
        <span class="grey--text caption">ยอดรวมที่แสดง <b class="price">{{ shownTotal | baht }}</b></span>
      </div>

      <v-data-table
        :headers="headers"
        :items="rows"
        :search="search"
        :loading="loading"
        loading-text="กำลังโหลด..."
        no-data-text="ไม่มีออเดอร์"
        sort-by="createdAt"
        sort-desc
      >
        <template v-slot:[`item.createdAt`]="{ item }">
          <div>{{ item.createdAt | dateTime }}</div>
          <div class="caption grey--text">#{{ item.code }}</div>
        </template>
        <template v-slot:[`item.productName`]="{ item }">
          <div class="d-flex align-center py-2">
            <div class="thumb mr-3"><ProductImage :product="item.product || { name: '?' }" /></div>
            <span>{{ item.productName }}</span>
          </div>
        </template>
        <template v-slot:[`item.unitPrice`]="{ item }">{{ item.unitPrice | baht }}</template>
        <template v-slot:[`item.totalPrice`]="{ item }"><b class="price">{{ item.totalPrice | baht }}</b></template>
        <template v-slot:[`item.status`]="{ item }"><OrderStatusChip :status="item.status" /></template>
        <template v-slot:[`item.actions`]="{ item }">
          <!-- ปุ่มเลื่อนสถานะถัดไป + ปุ่มยกเลิก (แสดงเท่าที่สถานะปัจจุบันเปลี่ยนต่อได้) -->
          <v-btn v-if="nextStep(item)" x-small depressed rounded color="primary" :loading="busy === item._id" @click="advance(item)">
            {{ nextStep(item).label }}
          </v-btn>
          <v-btn v-if="canCancel(item.status)" icon x-small color="error" class="ml-1" aria-label="ยกเลิก" :disabled="busy === item._id" @click="askCancel(item)">
            <v-icon small>mdi-close-circle-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <ConfirmDialog v-model="cancelOpen" title="ยกเลิกออเดอร์นี้?" confirm-text="ยืนยันยกเลิก" :loading="busy === (target && target._id)" @confirm="cancel">
      ยกเลิกออเดอร์ <b>{{ target && target.productName }}</b> ของ {{ target && target.userName }} จำนวน {{ target && target.quantity }} ชิ้น
      ระบบจะคืนสินค้ากลับเข้าสต็อก และไม่สามารถย้อนกลับได้
    </ConfirmDialog>
  </div>
</template>

<script>
import api from '../../api'
import { ORDER_STATUS, NEXT_STATUS, statusOf, canCancel } from '../../utils/status'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
import OrderStatusChip from '../../components/OrderStatusChip.vue'
import ProductImage from '../../components/ProductImage.vue'

export default {
  components: { ConfirmDialog, OrderStatusChip, ProductImage },
  data () {
    return {
      orders: [],
      loading: true,
      error: '',
      search: '',
      filter: 'all',
      busy: '', // id ของออเดอร์ที่กำลังเปลี่ยนสถานะ (ใช้แสดงปุ่มหมุน)
      cancelOpen: false,
      target: null,
      headers: [
        { text: 'วันที่ / เลขที่', value: 'createdAt' },
        { text: 'สินค้า', value: 'productName' },
        { text: 'ผู้สั่ง', value: 'userName' },
        { text: 'จำนวน', value: 'quantity', align: 'end' },
        { text: 'ราคา/ชิ้น', value: 'unitPrice', align: 'end' },
        { text: 'รวม', value: 'totalPrice', align: 'end' },
        { text: 'สถานะ', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' }
      ]
    }
  },
  computed: {
    filters () {
      return [{ text: 'ทั้งหมด', value: 'all' }, ...Object.values(ORDER_STATUS).map(s => ({ text: s.text, value: s.value }))]
    },
    // จัดข้อมูลให้พร้อมแสดงในตาราง (แยกชื่อสินค้า/ผู้สั่งออกมาเป็นข้อความเพื่อให้ค้นหาได้)
    rows () {
      return this.orders
        .filter(o => this.filter === 'all' || statusOf(o.status).value === this.filter)
        .map(o => ({
          ...o,
          status: statusOf(o.status).value,
          code: o._id.slice(-6).toUpperCase(),
          productName: o.product ? o.product.name : 'สินค้าถูกลบแล้ว',
          userName: o.user ? o.user.name : '-'
        }))
    },
    shownTotal () { return this.rows.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalPrice, 0) }
  },
  created () {
    this.load()
  },
  methods: {
    canCancel,
    countOf (value) {
      return value === 'all' ? this.orders.length : this.orders.filter(o => statusOf(o.status).value === value).length
    },
    // ปุ่ม "ขั้นถัดไป": รอยืนยัน -> ยืนยันออเดอร์, ยืนยันแล้ว -> จัดส่งแล้ว
    nextStep (order) {
      const next = NEXT_STATUS[order.status].find(s => s !== 'cancelled')
      return next ? { value: next, label: next === 'confirmed' ? 'ยืนยัน' : 'จัดส่งแล้ว' } : null
    },
    async load () {
      this.loading = true
      this.error = ''
      try {
        this.orders = await api.get('/orders')
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    // เปลี่ยนสถานะ (PUT /orders/:id/status) แล้วอัปเดตแถวนั้นด้วยข้อมูลที่ backend ส่งกลับมา
    async setStatus (order, status) {
      this.busy = order._id
      try {
        const updated = await api.put('/orders/' + order._id + '/status', { status })
        const i = this.orders.findIndex(o => o._id === order._id)
        this.$set(this.orders, i, updated)
        this.$store.commit('notify', { text: status === 'cancelled' ? 'ยกเลิกออเดอร์แล้ว สต็อกถูกคืนเรียบร้อย' : 'อัปเดตสถานะเป็น "' + statusOf(status).text + '" แล้ว' })
        return true
      } catch (e) {
        this.$store.commit('notify', { text: e.message, color: 'error' })
        this.load() // สถานะอาจถูกเปลี่ยนโดยคนอื่นไปก่อน โหลดใหม่ให้ตรงกับความจริง
        return false
      } finally {
        this.busy = ''
      }
    },
    advance (order) {
      return this.setStatus(order, this.nextStep(order).value)
    },
    askCancel (order) {
      this.target = order
      this.cancelOpen = true
    },
    async cancel () {
      await this.setStatus(this.target, 'cancelled')
      this.cancelOpen = false
    }
  }
}
</script>

<style scoped>
.opacity { opacity: 0.6; }
.bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 14px 14px 4px; }
.search { max-width: 340px; }
.thumb { width: 44px; height: 44px; border-radius: 12px; overflow: hidden; flex-shrink: 0; }
</style>
