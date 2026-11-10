// Store ส่วนผู้ใช้: เก็บ token และข้อมูลผู้ใช้ที่ login (จำไว้ใน localStorage เพื่อไม่ต้อง login ใหม่ตอนรีเฟรชหน้า)
const KEY = 'shop_session'

// อ่านค่าที่เคยบันทึกไว้ (ครอบ try/catch เผื่อ localStorage ใช้ไม่ได้)
const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch (e) { return {} }
}

export default {
  namespaced: true,
  state: () => ({
    token: load().token || '',
    user: load().user || null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => !!state.user && state.user.role === 'admin'
  },
  mutations: {
    setSession (state, { token, user }) {
      state.token = token
      state.user = user
      try { localStorage.setItem(KEY, JSON.stringify({ token, user })) } catch (e) { /* ignore */ }
    },
    // อัปเดตข้อมูลผู้ใช้ที่ login อยู่ (เช่น หลังแก้ชื่อ/เปลี่ยนรูปโปรไฟล์) โดยไม่ต้อง login ใหม่
    updateUser (state, patch) {
      state.user = { ...state.user, ...patch }
      try { localStorage.setItem(KEY, JSON.stringify({ token: state.token, user: state.user })) } catch (e) { /* ignore */ }
    },
    clearSession (state) {
      state.token = ''
      state.user = null
      try { localStorage.removeItem(KEY) } catch (e) { /* ignore */ }
    }
  },
  actions: {
    // ออกจากระบบ: ล้าง session และล้างตะกร้า (ตะกร้าเป็นของผู้ใช้คนนั้น)
    logout ({ commit }) {
      commit('clearSession')
      commit('cart/clear', null, { root: true })
    }
  }
}
