<template>
  <v-container class="page-wrap rail-safe">
    <h1 class="page-title mb-1">{{ isAdmin ? 'ออเดอร์ทั้งหมด' : 'ออเดอร์ของฉัน' }}</h1>
    <p class="grey--text mb-6">{{ isAdmin ? 'รายการสั่งซื้อของสมาชิกทุกคน' : 'ประวัติการสั่งซื้อของคุณ' }}</p>

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

    <v-card class="card pa-2">
      <v-card-title class="pb-0">
        <v-text-field v-model="search" placeholder="ค้นหาออเดอร์..." prepend-inner-icon="mdi-magnify" hide-details outlined dense clearable class="search" />
      </v-card-title>

      <!-- ตารางออเดอร์ -->
      <v-data-table
        :headers="headers"
        :items="rows"
        :search="search"
        :loading="loading"
        loading-text="กำลังโหลด..."
        no-data-text="ยังไม่มีออเดอร์"
        sort-by="createdAt"
        sort-desc
      >
        <template v-slot:[`item.createdAt`]="{ item }">{{ item.createdAt | dateTime }}</template>
        <template v-slot:[`item.unitPrice`]="{ item }">{{ item.unitPrice | baht }}</template>
        <template v-slot:[`item.totalPrice`]="{ item }"><b class="price">{{ item.totalPrice | baht }}</b></template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import api from '../api'
import { baht } from '../utils/format'

export default {
  data () {
    return { orders: [], loading: true, error: '', search: '' }
  },
  computed: {
    isAdmin () { return this.$store.getters['auth/isAdmin'] },
    me () { return this.$store.state.auth.user },

    // backend ส่งออเดอร์ทั้งระบบมา: สมาชิกทั่วไปกรองเหลือเฉพาะของตัวเอง, admin เห็นทั้งหมด
    visible () {
      return this.isAdmin ? this.orders : this.orders.filter(o => o.user && o.user._id === this.me._id)
    },
    // จัดข้อมูลให้พร้อมแสดงในตาราง (แยกชื่อสินค้า/ผู้สั่งออกมาเป็นข้อความ)
    rows () {
      return this.visible.map(o => ({
        ...o,
        productName: o.product ? o.product.name : 'สินค้าถูกลบแล้ว',
        userName: o.user ? o.user.name : '-'
      }))
    },
    headers () {
      const cols = [
        { text: 'วันที่สั่ง', value: 'createdAt' },
        { text: 'สินค้า', value: 'productName' },
        { text: 'ผู้สั่ง', value: 'userName' },
        { text: 'จำนวน', value: 'quantity', align: 'end' },
        { text: 'ราคา/ชิ้น', value: 'unitPrice', align: 'end' },
        { text: 'รวม', value: 'totalPrice', align: 'end' }
      ]
      return this.isAdmin ? cols : cols.filter(c => c.value !== 'userName') // สมาชิกไม่ต้องเห็นคอลัมน์ผู้สั่ง
    },
    stats () {
      const total = this.visible.reduce((s, o) => s + o.totalPrice, 0)
      const items = this.visible.reduce((s, o) => s + o.quantity, 0)
      return [
        { label: 'จำนวนออเดอร์', value: this.visible.length, icon: 'mdi-receipt-text', color: 'primary' },
        { label: 'จำนวนสินค้าทั้งหมด', value: items + ' ชิ้น', icon: 'mdi-package-variant-closed', color: 'accent' },
        { label: 'ยอดรวม', value: baht(total), icon: 'mdi-cash-multiple', color: 'success' }
      ]
    }
  },
  created () {
    this.load()
  },
  methods: {
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
    }
  }
}
</script>

<style scoped>
.stat-value { font-family: 'Kanit', sans-serif; font-size: 1.5rem; font-weight: 600; }
.search { max-width: 360px; }
</style>
