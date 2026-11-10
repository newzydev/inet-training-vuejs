import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import th from 'vuetify/es5/locale/th' // ข้อความภาษาไทยของ Vuetify (ตาราง, ปุ่มเปลี่ยนหน้า ฯลฯ)

Vue.use(Vuetify)

// กำหนดสีหลักของธีม และเปิดใช้ภาษาไทย
export default new Vuetify({
  lang: { locales: { th }, current: 'th' },
  theme: {
    themes: {
      light: { primary: '#5b3df5', secondary: '#ec4899', accent: '#06b6d4' }
    }
  }
})
