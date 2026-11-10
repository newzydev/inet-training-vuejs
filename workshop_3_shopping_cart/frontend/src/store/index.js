import Vue from 'vue'
import Vuex from 'vuex'
import auth from './auth'
import cart from './cart'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: { auth, cart },
  // ข้อความแจ้งเตือนมุมจอ (snackbar) ที่ทุกหน้าเรียกใช้ได้: this.$store.commit('notify', { text, color })
  state: {
    notice: { show: false, text: '', color: 'success' }
  },
  mutations: {
    notify (state, { text, color = 'success' }) {
      state.notice = { show: true, text, color }
    },
    closeNotice (state) {
      state.notice.show = false
    }
  }
})

// ทุกครั้งที่ตะกร้าเปลี่ยน ให้บันทึกลง localStorage อัตโนมัติ
store.subscribe((mutation, state) => {
  if (mutation.type.startsWith('cart/')) {
    try { localStorage.setItem('shop_cart', JSON.stringify(state.cart.items)) } catch (e) { /* ignore */ }
  }
})

export default store
