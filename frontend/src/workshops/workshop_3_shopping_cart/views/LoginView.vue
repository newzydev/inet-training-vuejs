<template>
  <v-row no-gutters class="login-page">
    <!-- ฝั่งซ้าย: แนะนำร้าน (ซ่อนบนมือถือ) -->
    <v-col md="6" class="hero d-none d-md-flex">
      <!-- padding ต้องอยู่ที่ div ด้านใน เพราะ v-row แบบ no-gutters จะลบ padding ของ v-col -->
      <div class="hero-inner">
        <div class="logo">นิว<span>.shop</span></div>
        <h1 class="headline">ช้อปง่าย<br>สั่งซื้อได้ในไม่กี่คลิก</h1>
        <div v-for="f in features" :key="f.text" class="feature">
          <v-avatar size="40" color="rgba(255,255,255,.16)" class="mr-4"><v-icon color="white">{{ f.icon }}</v-icon></v-avatar>
          {{ f.text }}
        </div>
      </div>
    </v-col>

    <!-- ฝั่งขวา: ฟอร์ม -->
    <v-col cols="12" md="6" class="form-side">
      <v-card class="card form-card pa-8" flat>
        <h2 class="page-title mb-1">{{ tab === 0 ? 'ยินดีต้อนรับกลับมา' : 'สร้างบัญชีใหม่' }}</h2>
        <p class="grey--text mb-4">{{ tab === 0 ? 'เข้าสู่ระบบเพื่อเลือกซื้อสินค้า' : 'สมัครแล้วรอผู้ดูแลระบบอนุมัติก่อนเข้าใช้งาน' }}</p>

        <v-tabs v-model="tab" grow class="mb-6" @change="error = ''">
          <v-tab>เข้าสู่ระบบ</v-tab>
          <v-tab>สมัครสมาชิก</v-tab>
        </v-tabs>

        <v-alert v-if="info" type="success" text dense class="mb-4">{{ info }}</v-alert>
        <v-alert v-if="error" type="error" text dense class="mb-4">{{ error }}</v-alert>

        <!-- @submit.prevent = กด Enter หรือกดปุ่มแล้วเรียก submit() โดยไม่รีเฟรชหน้า -->
        <v-form ref="form" @submit.prevent="submit">
          <v-text-field v-if="tab === 1" v-model="name" label="ชื่อ" outlined prepend-inner-icon="mdi-account-outline" :rules="[required]" />
          <v-text-field v-model="email" label="อีเมล" type="email" outlined prepend-inner-icon="mdi-email-outline" :rules="[required]" />
          <v-text-field
            v-model="password"
            label="รหัสผ่าน"
            outlined
            prepend-inner-icon="mdi-lock-outline"
            :type="showPass ? 'text' : 'password'"
            :append-icon="showPass ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            :rules="[required]"
            @click:append="showPass = !showPass"
          />
          <v-btn type="submit" block large depressed color="primary" :loading="loading" class="mt-2">
            {{ tab === 0 ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก' }}
          </v-btn>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import api from '../api'

export default {
  data () {
    return {
      tab: 0, // 0 = เข้าสู่ระบบ, 1 = สมัครสมาชิก
      name: '',
      email: '',
      password: '',
      showPass: false,
      loading: false,
      error: '',
      info: '',
      features: [
        { icon: 'mdi-shield-check-outline', text: 'ระบบสมาชิกที่ผู้ดูแลอนุมัติ ปลอดภัย' },
        { icon: 'mdi-cart-outline', text: 'หยิบใส่ตะกร้าและสั่งซื้อได้ทันที' },
        { icon: 'mdi-package-variant-closed', text: 'เช็กสต็อกสินค้าแบบเรียลไทม์' }
      ]
    }
  },
  methods: {
    required: (v) => !!v || 'กรุณากรอกข้อมูล',

    async submit () {
      if (!this.$refs.form.validate()) return
      this.error = ''
      this.info = ''
      this.loading = true
      try {
        if (this.tab === 0) await this.login()
        else await this.register()
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    // เข้าสู่ระบบ: เก็บ token + ผู้ใช้ลง store แล้วไปหน้าที่ตั้งใจจะเข้า (หรือหน้าร้าน)
    async login () {
      const { token, user } = await api.post('/login', { email: this.email, password: this.password })
      this.$store.commit('auth/setSession', { token, user })
      this.$store.commit('notify', { text: 'ยินดีต้อนรับ ' + user.name })
      this.$router.push(this.$route.query.redirect || '/workshop-3')
    },

    // สมัครสมาชิก: สำเร็จแล้วสลับไปแท็บเข้าสู่ระบบ พร้อมแจ้งให้รออนุมัติ
    async register () {
      await api.post('/register', { name: this.name, email: this.email, password: this.password })
      this.tab = 0
      this.password = ''
      this.info = 'สมัครสำเร็จ! กรุณารอผู้ดูแลระบบอนุมัติ แล้วจึงเข้าสู่ระบบได้'
    }
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; }
/* เว้นซ้ายมากหน่อย ไม่ให้แถบเลือก Workshop ที่ลอยอยู่ด้านซ้ายทับข้อความ */
.hero-inner { padding: 64px 64px 64px 120px; }
.hero {
  align-items: center;
  color: #fff;
  background:
    radial-gradient(circle at 15% 20%, rgba(236, 72, 153, 0.5), transparent 40%),
    radial-gradient(circle at 85% 80%, rgba(6, 182, 212, 0.4), transparent 40%),
    linear-gradient(135deg, #1e1b6e 0%, #4f46e5 55%, #7c3aed 100%);
}
.logo { font-family: 'Kanit', sans-serif; font-size: 1.6rem; font-weight: 700; margin-bottom: 48px; }
.logo span { color: #f9a8d4; }
.headline { font-family: 'Kanit', sans-serif; font-size: 3rem; line-height: 1.25; font-weight: 600; margin-bottom: 40px; }
.feature { display: flex; align-items: center; margin-bottom: 18px; font-size: 1.05rem; opacity: 0.95; }
.form-side { display: flex; align-items: center; justify-content: center; padding: 32px 16px; }
.form-card { width: 100%; max-width: 440px; background: #fff; }
</style>
