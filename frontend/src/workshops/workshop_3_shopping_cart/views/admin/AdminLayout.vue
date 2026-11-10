<template>
  <v-container class="page-wrap rail-safe">
    <div class="head">
      <div>
        <h1 class="page-title">จัดการร้าน</h1>
        <p class="page-sub mb-0">ภาพรวม สินค้า ออเดอร์ และผู้ใช้ ในที่เดียว</p>
      </div>
    </div>

    <!-- แท็บเมนูของส่วน admin: v-tab :to = ลิงก์ไปหน้าลูก และขึ้น active เองตาม URL -->
    <v-tabs class="tabs" background-color="transparent" show-arrows>
      <v-tab v-for="t in tabs" :key="t.to" :to="t.to" class="tab">
        <v-icon left small>{{ t.icon }}</v-icon>{{ t.title }}
      </v-tab>
    </v-tabs>

    <!-- หน้าลูก: dashboard / products / orders / users (ดู routes.js) -->
    <router-view />
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      tabs: [
        { title: 'ภาพรวม', icon: 'mdi-view-dashboard-outline', to: '/workshop-3/admin/dashboard' },
        { title: 'สินค้า', icon: 'mdi-package-variant-closed', to: '/workshop-3/admin/products' },
        { title: 'ออเดอร์', icon: 'mdi-receipt-text-outline', to: '/workshop-3/admin/orders' },
        { title: 'ผู้ใช้', icon: 'mdi-account-group-outline', to: '/workshop-3/admin/users' }
      ]
    }
  }
}
</script>

<style scoped>
.head { margin-bottom: 18px; }
.tabs { margin-bottom: 26px; border-bottom: 1px solid #e8e8f4; }
.tab { font-weight: 500; letter-spacing: 0; text-transform: none; }
</style>
