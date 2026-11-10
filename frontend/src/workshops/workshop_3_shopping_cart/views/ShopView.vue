<template>
  <v-container class="page-wrap rail-safe">
    <!-- ================= แบนเนอร์ต้อนรับ + ช่องค้นหา ================= -->
    <section class="hero">
      <span class="orb orb-1"></span><span class="orb orb-2"></span>
      <div class="hero-content">
        <div class="hello">สวัสดี {{ firstName }}</div>
        <h1 class="page-title white--text">วันนี้อยากได้อะไรดี?</h1>
        <p class="hero-sub">{{ products.length }} รายการ · มีของพร้อมสั่ง {{ available }} รายการ</p>

        <v-text-field
          v-model="search"
          class="search"
          placeholder="ค้นหาชื่อสินค้า..."
          prepend-inner-icon="mdi-magnify"
          solo
          flat
          rounded
          hide-details
          clearable
        />
      </div>
    </section>

    <!-- ================= ตัวกรอง + เรียงลำดับ ================= -->
    <div class="toolbar">
      <v-chip-group v-model="filter" mandatory active-class="primary white--text" class="chips">
        <v-chip v-for="f in filters" :key="f.value" :value="f.value" label>{{ f.text }}</v-chip>
      </v-chip-group>
      <v-spacer />
      <span class="count d-none d-sm-inline">แสดง {{ shown.length }} รายการ</span>
      <v-select v-model="sort" :items="sortItems" dense outlined rounded hide-details class="sort" prepend-inner-icon="mdi-sort" />
    </div>

    <!-- กำลังโหลด: โครงเปล่า (skeleton) -->
    <v-row v-if="loading">
      <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="image, article" class="skeleton" />
      </v-col>
    </v-row>

    <!-- โหลดไม่สำเร็จ -->
    <v-alert v-else-if="error" type="error" text>
      {{ error }}
      <template v-slot:append><v-btn small text color="error" @click="load">ลองใหม่</v-btn></template>
    </v-alert>

    <!-- ไม่พบสินค้า -->
    <div v-else-if="!shown.length" class="empty">
      <v-icon size="72" color="grey lighten-1">mdi-package-variant</v-icon>
      <div class="mt-3 grey--text">{{ products.length ? 'ไม่พบสินค้าที่ตรงกับตัวกรอง' : 'ยังไม่มีสินค้าในร้าน' }}</div>
      <v-btn v-if="products.length" depressed rounded color="primary" class="mt-4" @click="reset">ล้างตัวกรอง</v-btn>
    </div>

    <!-- รายการสินค้า: v-for วนสร้างการ์ดทีละใบ -->
    <v-row v-else>
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
      filter: 'all',
      sort: 'new',
      filters: [
        { text: 'ทั้งหมด', value: 'all' },
        { text: 'มีของ', value: 'available' },
        { text: 'เหลือน้อย', value: 'low' }
      ],
      sortItems: [
        { text: 'ใหม่ล่าสุด', value: 'new' },
        { text: 'ราคา ต่ำ → สูง', value: 'asc' },
        { text: 'ราคา สูง → ต่ำ', value: 'desc' },
        { text: 'ชื่อ ก → ฮ', value: 'name' }
      ]
    }
  },
  computed: {
    firstName () {
      const user = this.$store.state.auth.user
      return user ? user.name.split(' ')[0] : ''
    },
    available () { return this.products.filter(p => p.stock > 0).length },

    // รายการที่แสดงจริง: กรองตามคำค้นและตัวกรอง แล้วเรียงลำดับ
    shown () {
      const key = (this.search || '').trim().toLowerCase()
      let list = this.products.filter(p => !key || p.name.toLowerCase().includes(key))
      if (this.filter === 'available') list = list.filter(p => p.stock > 0)
      if (this.filter === 'low') list = list.filter(p => p.stock > 0 && p.stock <= 5)
      if (this.sort === 'asc') list = [...list].sort((a, b) => a.price - b.price)
      if (this.sort === 'desc') list = [...list].sort((a, b) => b.price - a.price)
      if (this.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'th'))
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
    },
    reset () {
      this.search = ''
      this.filter = 'all'
      this.sort = 'new'
    }
  }
}
</script>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 44px 40px 48px;
  border-radius: 30px;
  color: #fff;
  background:
    radial-gradient(circle at 12% 18%, rgba(236, 72, 153, 0.55), transparent 42%),
    radial-gradient(circle at 92% 90%, rgba(6, 182, 212, 0.4), transparent 40%),
    linear-gradient(135deg, #25207a 0%, #4f46e5 55%, #7c3aed 100%);
  box-shadow: 0 30px 60px -30px rgba(79, 70, 229, 0.7);
}
/* วงกลมตกแต่งโปร่งแสง */
.orb { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.07); }
.orb-1 { width: 280px; height: 280px; right: -70px; top: -90px; }
.orb-2 { width: 160px; height: 160px; right: 180px; bottom: -80px; }
.hero-content { position: relative; max-width: 620px; }
.hello { opacity: 0.85; font-size: 1.05rem; }
.hero-sub { opacity: 0.8; margin: 6px 0 22px; }
.search >>> .v-input__slot { min-height: 56px !important; box-shadow: 0 16px 34px -16px rgba(0, 0, 0, 0.5) !important; }
.search >>> input { font-size: 1.05rem; }

.toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin: 26px 0 14px; }
.chips >>> .v-chip { font-weight: 500; }
.count { color: #9ca3af; font-size: 0.88rem; }
.sort { max-width: 200px; background: #fff; border-radius: 28px; }

.skeleton { border-radius: 22px; }
.empty { text-align: center; padding: 90px 0; }

@media (max-width: 600px) {
  .hero { padding: 32px 22px 34px; border-radius: 24px; }
  .toolbar { margin-top: 20px; }
}
</style>
