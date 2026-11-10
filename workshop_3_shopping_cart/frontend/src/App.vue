<template>
  <v-app>
    <!-- ================= แถบเมนูด้านบน (ไม่แสดงในหน้า login) ================= -->
    <v-app-bar v-if="$route.name !== 'login'" app color="white" flat height="68" class="topbar">
      <v-container class="d-flex align-center py-0">
        <router-link to="/" class="brand">นิว<span>.shop</span></router-link>

        <!-- เมนูหลัก (v-for จากข้อมูล links) -->
        <div class="d-none d-md-flex ml-8">
          <v-btn v-for="l in links" :key="l.to" text :to="l.to" exact class="nav-btn">
            <v-icon left small>{{ l.icon }}</v-icon>{{ l.title }}
          </v-btn>
        </div>

        <v-spacer />

        <!-- ไอคอนตะกร้า + จำนวนชิ้น -->
        <v-btn icon to="/cart" class="mr-2">
          <v-badge :content="cartCount" :value="cartCount > 0" color="secondary" overlap>
            <v-icon>mdi-cart-outline</v-icon>
          </v-badge>
        </v-btn>

        <!-- เมนูผู้ใช้ -->
        <v-menu offset-y left>
          <template v-slot:activator="{ on }">
            <v-btn text class="user-btn" v-on="on">
              <v-avatar size="32" color="primary" class="mr-2">
                <v-img v-if="avatar" :src="avatar" />
                <span v-else class="white--text">{{ initial }}</span>
              </v-avatar>
              <span class="d-none d-sm-inline">{{ user && user.name }}</span>
              <v-icon right small>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{ user && user.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ user && user.email }}</v-list-item-subtitle>
                <div class="mt-1">
                  <v-chip x-small :color="isAdmin ? 'secondary' : 'primary'" dark>{{ isAdmin ? 'ผู้ดูแลระบบ' : 'สมาชิก' }}</v-chip>
                </div>
              </v-list-item-content>
            </v-list-item>
            <v-divider />
            <!-- ลิงก์เมนูบนมือถือ (จอเล็กไม่มีแถบเมนูหลัก) -->
            <v-list-item v-for="l in links" :key="'m' + l.to" :to="l.to" class="d-md-none">
              <v-list-item-icon><v-icon small>{{ l.icon }}</v-icon></v-list-item-icon>
              <v-list-item-title>{{ l.title }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-icon><v-icon small color="error">mdi-logout</v-icon></v-list-item-icon>
              <v-list-item-title class="error--text">ออกจากระบบ</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-container>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <!-- แจ้งเตือนมุมจอ (เรียกผ่าน store: commit('notify')) -->
    <v-snackbar v-model="show" :color="notice.color" bottom right timeout="2800">
      {{ notice.text }}
    </v-snackbar>
  </v-app>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { imageUrl } from '@/api'

export default {
  computed: {
    ...mapState('auth', ['user']),
    ...mapState(['notice']),
    ...mapGetters('auth', ['isAdmin']),
    cartCount () { return this.$store.getters['cart/count'] },
    avatar () { return this.user && this.user.avatar ? imageUrl(this.user.avatar) : '' },
    initial () { return this.user ? this.user.name.charAt(0).toUpperCase() : '' },
    // ผูก v-snackbar กับ store (เปิด/ปิดผ่าน mutation)
    show: {
      get () { return this.notice.show },
      set (v) { if (!v) this.$store.commit('closeNotice') }
    },
    // รายการเมนู: admin จะเห็นเมนูจัดการเพิ่ม
    links () {
      const list = [
        { title: 'สินค้า', icon: 'mdi-storefront-outline', to: '/' },
        { title: this.isAdmin ? 'ออเดอร์ทั้งหมด' : 'ออเดอร์ของฉัน', icon: 'mdi-receipt-text-outline', to: '/orders' }
      ]
      if (this.isAdmin) list.push({ title: 'จัดการสินค้า', icon: 'mdi-package-variant-closed', to: '/manage' })
      return list
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('auth/logout')
      this.$router.push({ name: 'login' })
    }
  }
}
</script>

<style>
/* ฟอนต์เนื้อหา = IBM Plex Sans Thai / ฟอนต์หัวข้อ = Kanit */
.v-application { font-family: 'IBM Plex Sans Thai', sans-serif !important; }
.v-application .brand,
.v-application .page-title,
.v-application .price,
.v-application .display-font {
  font-family: 'Kanit', sans-serif !important;
}
.v-application.theme--light { background: #f6f5fd !important; }

.topbar { border-bottom: 1px solid #ececf6 !important; }
.v-application a.brand {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e1b4b;
  text-decoration: none;
}
.v-application a.brand span { color: #ec4899; }
.nav-btn { font-weight: 500; letter-spacing: 0; }
.user-btn { text-transform: none; letter-spacing: 0; }

/* ใช้ร่วมกันหลายหน้า */
.page-wrap { max-width: 1180px; padding-top: 32px; padding-bottom: 56px; }
.page-title { font-size: 1.9rem; font-weight: 600; color: #1e1b4b; }
.card {
  border-radius: 20px !important;
  border: 1px solid #ececf6 !important;
  box-shadow: 0 14px 34px -22px rgba(79, 70, 229, 0.45) !important;
}
.price { color: #4f46e5; font-weight: 600; }
</style>
