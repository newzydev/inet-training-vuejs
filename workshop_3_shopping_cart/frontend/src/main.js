import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { baht, dateTime } from './utils/format'

Vue.config.productionTip = false

// filter ที่ใช้ได้ทุกหน้า: {{ price | baht }}  {{ createdAt | dateTime }}
Vue.filter('baht', baht)
Vue.filter('dateTime', dateTime)

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
