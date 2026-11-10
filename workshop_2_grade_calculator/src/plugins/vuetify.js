import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

// กำหนดสีหลักของธีม (ใช้ผ่าน color="primary" ได้ทุกที่)
export default new Vuetify({
  theme: {
    themes: {
      light: { primary: '#5b3df5', secondary: '#ec4899', accent: '#06b6d4' },
      dark: { primary: '#8b7bff', secondary: '#f472b6', accent: '#22d3ee' }
    }
  }
})
