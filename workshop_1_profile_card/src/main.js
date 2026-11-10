import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

// จุดเริ่มต้นของแอป: สร้าง Vue instance แล้วนำ App.vue ไปแสดงที่ <div id="app">
new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
