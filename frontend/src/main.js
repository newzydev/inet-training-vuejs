import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store' // Vuex store (ผู้ใช้ + ตะกร้าของ Workshop 3)
import vuetify from './plugins/vuetify'
import { baht, dateTime } from './workshops/workshop_3_shopping_cart/utils/format'

Vue.config.productionTip = false

// filter ที่ Workshop 3 ใช้ในเทมเพลต: {{ price | baht }}  {{ createdAt | dateTime }}
Vue.filter('baht', baht)
Vue.filter('dateTime', dateTime)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
