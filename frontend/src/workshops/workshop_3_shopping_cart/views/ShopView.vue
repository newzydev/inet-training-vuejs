<template>
  <v-container class="page-wrap rail-safe">
    <!-- ส่วนหัว + ค้นหา/เรียงลำดับ -->
    <div class="banner">
      <h1 class="page-title white--text">เลือกสินค้าที่ถูกใจ</h1>
      <p class="white--text mb-4" style="opacity:.85">มีสินค้า {{ products.length }} รายการ</p>
      <v-row dense>
        <v-col cols="12" md="7">
          <v-text-field v-model="search" placeholder="ค้นหาชื่อสินค้า..." prepend-inner-icon="mdi-magnify" solo flat hide-details clearable rounded />
        </v-col>
        <v-col cols="8" md="3">
          <v-select v-model="sort" :items="sortItems" solo flat hide-details rounded />
        </v-col>
        <v-col cols="4" md="2" class="d-flex align-center">
          <v-checkbox v-model="inStockOnly" label="มีของ" dark hide-details class="mt-0" />
        </v-col>
      </v-row>
    </div>

    <!-- กำลังโหลด: โครงเปล่า (skeleton) -->
    <v-row v-if="loading" class="mt-4">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="image, article" class="card" />
      </v-col>
    </v-row>

    <!-- โหลดไม่สำเร็จ -->
    <v-alert v-else-if="error" type="error" text class="mt-6">
      {{ error }}
      <template v-slot:append><v-btn small text color="error" @click="load">ลองใหม่</v-btn></template>
    </v-alert>

    <!-- ไม่มีสินค้าตรงกับที่ค้นหา -->
    <div v-else-if="!shown.length" class="empty">
      <v-icon size="64" color="grey lighten-1">mdi-package-variant</v-icon>
      <div class="mt-3 grey--text">{{ products.length ? 'ไม่พบสินค้าที่ตรงกับการค้นหา' : 'ยังไม่มีสินค้าในร้าน' }}</div>
    </div>

    <!-- รายการสินค้า: v-for วนสร้างการ์ดทีละใบ -->
    <v-row v-else class="mt-2">
      <v-col v-for="p in shown" :key="p._id" cols="12" sm="6" md="4" lg="3">
        <ProductCard :product="p" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '../api'
import ProductCard from '../components/ProductCard.vue'

export default {
  components: { ProductCard },
  data () {
    return {
      products: [],
      loading: true,
      error: '',
      search: '',
      sort: 'new',
      inStockOnly: false,
      sortItems: [
        { text: 'ใหม่ล่าสุด', value: 'new' },
        { text: 'ราคา ต่ำ → สูง', value: 'asc' },
        { text: 'ราคา สูง → ต่ำ', value: 'desc' }
      ]
    }
  },
  computed: {
    // รายการที่แสดงจริง: กรองตามคำค้น/มีของ แล้วเรียงลำดับ
    shown () {
      const key = (this.search || '').trim().toLowerCase()
      let list = this.products.filter(p => !key || p.name.toLowerCase().includes(key))
      if (this.inStockOnly) list = list.filter(p => p.stock > 0)
      if (this.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price)
      if (this.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price)
      return list
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
        this.products = await api.get('/products')
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
.banner {
  padding: 36px;
  border-radius: 24px;
  background:
    radial-gradient(circle at 90% 10%, rgba(236, 72, 153, 0.5), transparent 40%),
    linear-gradient(135deg, #312e81 0%, #4f46e5 60%, #7c3aed 100%);
}
.empty { text-align: center; padding: 80px 0; }
</style>
