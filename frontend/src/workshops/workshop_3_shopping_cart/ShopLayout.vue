<template>
  <div class="w3">
    <!-- ================= แถบเมนูด้านบน (ไม่แสดงในหน้า login) ================= -->
    <v-app-bar v-if="!isLogin" app height="68" elevate-on-scroll class="topbar">
      <v-container class="d-flex align-center py-0">
        <BrandLogo suffix="shop" to="/workshop-3" dark />

        <!-- เมนูหลัก (จอใหญ่): v-for จากข้อมูล links -->
        <div class="d-none d-md-flex ml-8 nav">
          <v-btn v-for="l in links" :key="l.to" text rounded :to="l.to" :exact="l.exact" class="nav-btn">
            <v-icon left small>{{ l.icon }}</v-icon>{{ l.title }}
          </v-btn>
        </div>

        <v-spacer />

        <!-- ไอคอนตะกร้า: กดแล้วเปิดตะกร้าแบบ drawer -->
        <v-btn icon large class="mr-2 cart-btn" aria-label="ตะกร้า" @click="$store.commit('setCartOpen', true)">
          <v-badge :content="cartCount" :value="cartCount > 0" color="secondary" overlap>
            <v-icon>mdi-cart-outline</v-icon>
          </v-badge>
        </v-btn>

        <!-- เมนูผู้ใช้ -->
        <v-menu offset-y left nudge-bottom="8" min-width="280" content-class="user-menu">
          <template v-slot:activator="{ on }">
            <v-btn text rounded class="user-btn" v-on="on">
              <v-avatar size="34" color="primary" class="mr-2">
                <v-img v-if="avatar" :src="avatar" />
                <span v-else class="white--text">{{ initial }}</span>
              </v-avatar>
              <span class="d-none d-sm-inline">{{ user && user.name }}</span>
              <v-icon right small>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list class="py-0">
            <!-- ส่วนหัวของเมนู: รูป + ชื่อ + อีเมล + บทบาท -->
            <div class="menu-head">
              <v-avatar size="46" color="primary">
                <v-img v-if="avatar" :src="avatar" />
                <span v-else class="white--text">{{ initial }}</span>
              </v-avatar>
              <div class="menu-who">
                <div class="m-name">{{ user && user.name }}</div>
                <div class="m-mail">{{ user && user.email }}</div>
                <v-chip x-small class="mt-1" :color="isAdmin ? 'secondary' : 'primary'" dark>{{ isAdmin ? 'ผู้ดูแลระบบ' : 'สมาชิก' }}</v-chip>
              </div>
            </div>
            <v-divider />
            <v-list-item @click="profileOpen = true">
              <v-list-item-icon><v-icon small>mdi-account-cog-outline</v-icon></v-list-item-icon>
              <v-list-item-title>โปรไฟล์ของฉัน</v-list-item-title>
            </v-list-item>
            <!-- ลิงก์เมนูบนมือถือ (จอเล็กไม่มีแถบเมนูหลัก) -->
            <v-list-item v-for="l in links" :key="'m' + l.to" :to="l.to" class="d-md-none">
              <v-list-item-icon><v-icon small>{{ l.icon }}</v-icon></v-list-item-icon>
              <v-list-item-title>{{ l.title }}</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="logout">
              <v-list-item-icon><v-icon small color="error">mdi-logout</v-icon></v-list-item-icon>
              <v-list-item-title class="error--text">ออกจากระบบ</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-container>
    </v-app-bar>

    <!-- หน้าต่าง ๆ ของ Workshop 3 (ดู routes.js) -->
    <router-view />

    <footer v-if="!isLogin" class="w3-footer">นิว.shop · Workshop 3 · Vue.js + Vuetify · INET Training</footer>

    <CartDrawer v-if="!isLogin" />
    <ProfileDialog v-if="!isLogin && user" v-model="profileOpen" />

    <!-- แจ้งเตือนมุมจอ (เรียกผ่าน store: commit('notify')) -->
    <v-snackbar v-model="show" :color="notice.color" bottom timeout="2800" rounded="pill">
      {{ notice.text }}
    </v-snackbar>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { imageUrl } from './api'
import CartDrawer from './components/CartDrawer.vue'
import BrandLogo from '@/shell/BrandLogo.vue'
import ProfileDialog from './components/ProfileDialog.vue'

export default {
  components: { CartDrawer, ProfileDialog, BrandLogo },
  data () {
    return { profileOpen: false }
  },
  computed: {
    ...mapState('auth', ['user']),
    ...mapState(['notice']),
    ...mapGetters('auth', ['isAdmin']),
    isLogin () { return this.$route.name === 'shop-login' },
    cartCount () { return this.$store.getters['cart/count'] },
    avatar () { return this.user && this.user.avatar ? imageUrl(this.user.avatar) : '' },
    initial () { return this.user ? this.user.name.charAt(0).toUpperCase() : '' },
    // ผูก v-snackbar กับ store (เปิด/ปิดผ่าน mutation)
    show: {
      get () { return this.notice.show },
      set (v) { if (!v) this.$store.commit('closeNotice') }
    },
    // รายการเมนู: admin จะเห็นเมนู "จัดการร้าน" เพิ่ม
    links () {
      const list = [
        { title: 'สินค้า', icon: 'mdi-storefront-outline', to: '/workshop-3', exact: true },
        { title: 'ออเดอร์ของฉัน', icon: 'mdi-receipt-text-outline', to: '/workshop-3/orders', exact: false }
      ]
      if (this.isAdmin) list.push({ title: 'จัดการร้าน', icon: 'mdi-view-dashboard-outline', to: '/workshop-3/admin', exact: false })
      return list
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('auth/logout')
      this.$router.push({ name: 'shop-login' })
    }
  }
}
</script>

<style lang="scss">
/* ทุกสไตล์อยู่ใต้ .w3 เพื่อไม่ชนกับ Workshop อื่นในแอปเดียวกัน */
.w3 {
  /* ฟอนต์หัวข้อ = Kanit (ฟอนต์เนื้อหาตั้งไว้ส่วนกลางใน App.vue) */
  .page-title,
  .price,
  .display-font {
    font-family: var(--font-heading) !important;
  }

  /* ---------- แถบเมนู: กระจกฝ้าโปร่งแสง ---------- */
  .topbar {
    background: rgba(255, 255, 255, 0.82) !important;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(99, 102, 241, 0.1) !important;
  }
  .nav-btn { font-weight: 500; letter-spacing: 0; }
  /* เมนูที่เปิดอยู่: พื้นสีม่วงอ่อน ตัวอักษรสีหลัก */
  .nav-btn.v-btn--active { background: #eef2ff; color: #4f46e5 !important; }
  .nav-btn.v-btn--active::before { opacity: 0; }
  /* ปุ่มผู้ใช้: เม็ดยาสีขาวขอบบาง ตอนเมนูเปิดเป็นสีม่วงอ่อน (ไม่ให้เป็นก้อนสีเทาทึบแบบค่าเริ่มต้นของ Vuetify) */
  .user-btn {
    text-transform: none;
    letter-spacing: 0;
    padding: 0 12px 0 6px !important;
    height: 46px !important;
    background: #fff;
    border: 1px solid #e6e7f5;
    transition: background 0.2s ease, border-color 0.2s ease;
  }
  .user-btn:hover, .user-btn.v-btn--active { background: #f1f0ff; border-color: #c9c9f5; }
  .user-btn::before, .user-btn.v-btn--active::before { opacity: 0 !important; }

  /* ---------- ส่วนที่ใช้ร่วมกันหลายหน้า ---------- */
  .page-wrap { padding-top: 36px; padding-bottom: 72px; }
  .page-title { font-size: 2rem; font-weight: 600; color: #1e1b4b; line-height: 1.25; }
  .page-sub { color: #6b7280; }
  .card {
    border-radius: 22px !important;
    border: 1px solid #ececf6 !important;
    box-shadow: 0 16px 38px -26px rgba(79, 70, 229, 0.5) !important;
  }
  .price { color: #4f46e5; font-weight: 600; }

  .w3-footer {
    text-align: center;
    padding: 28px 16px 36px;
    color: #a1a1b5;
    font-size: 0.82rem;
  }
}

/* ป๊อปอัปเมนูผู้ใช้ถูก Vuetify ย้ายออกนอก .w3 จึงเขียนสไตล์ที่นี่แบบส่วนกลาง */
.user-menu {
  border-radius: 20px !important;
  border: 1px solid #ececf6;
  box-shadow: 0 28px 56px -22px rgba(30, 27, 110, 0.45) !important;
  overflow: hidden;
}
.user-menu .menu-head { display: flex; align-items: center; gap: 14px; padding: 18px 18px 16px; background: linear-gradient(135deg, #f5f3ff, #fdf2f8); }
.user-menu .menu-who { min-width: 0; }
.user-menu .m-name { font-weight: 600; font-size: 1.02rem; color: #1e1b4b; }
.user-menu .m-mail { font-size: 0.8rem; color: #8b8fa8; overflow: hidden; text-overflow: ellipsis; }
.user-menu .v-list-item { min-height: 50px; padding: 0 18px; }
.user-menu .v-list-item__title { font-size: 0.95rem; }
.user-menu .v-list-item__icon { margin: 12px 16px 12px 0; }
</style>
