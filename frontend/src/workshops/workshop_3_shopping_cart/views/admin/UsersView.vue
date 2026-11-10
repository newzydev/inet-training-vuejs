<template>
  <div>
    <!-- สรุปตัวเลข -->
    <v-row class="mb-2">
      <v-col v-for="s in stats" :key="s.label" cols="12" sm="4">
        <v-card class="card pa-5 d-flex align-center">
          <v-avatar size="48" :color="s.color" class="mr-4"><v-icon color="white">{{ s.icon }}</v-icon></v-avatar>
          <div>
            <div class="grey--text text--darken-1 caption">{{ s.label }}</div>
            <div class="stat-value">{{ s.value }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" text>
      {{ error }}
      <template v-slot:append><v-btn small text color="error" @click="load">ลองใหม่</v-btn></template>
    </v-alert>

    <v-card class="card pa-2">
      <div class="bar">
        <v-text-field v-model="search" placeholder="ค้นหาชื่อหรืออีเมล..." prepend-inner-icon="mdi-magnify" hide-details outlined dense rounded clearable class="search" />
        <!-- ตัวกรองสถานะ: เลือกได้ทีละอัน -->
        <v-chip-group v-model="filter" mandatory active-class="primary white--text">
          <v-chip v-for="f in filters" :key="f.value" :value="f.value" small label>{{ f.text }}</v-chip>
        </v-chip-group>
      </div>

      <!-- ตารางผู้ใช้ -->
      <v-data-table
        :headers="headers"
        :items="shown"
        :search="search"
        :loading="loading"
        loading-text="กำลังโหลด..."
        no-data-text="ไม่มีผู้ใช้ในหมวดนี้"
        sort-by="createdAt"
        sort-desc
      >
        <template v-slot:[`item.name`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="36" color="primary" class="mr-3">
              <v-img v-if="item.avatar" :src="imageUrl(item.avatar)" />
              <span v-else class="white--text">{{ item.name.charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <div>
              <b>{{ item.name }}</b>
              <v-chip v-if="isMe(item)" x-small class="ml-2" color="primary" outlined>คุณ</v-chip>
            </div>
          </div>
        </template>
        <template v-slot:[`item.role`]="{ item }">
          <v-chip x-small :color="item.role === 'admin' ? 'secondary' : 'grey lighten-2'" :dark="item.role === 'admin'">
            {{ item.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก' }}
          </v-chip>
        </template>
        <template v-slot:[`item.approved`]="{ item }">
          <v-chip small :color="item.approved ? 'success' : 'warning'" text-color="white">
            {{ item.approved ? 'อนุมัติแล้ว' : 'รออนุมัติ' }}
          </v-chip>
        </template>
        <template v-slot:[`item.createdAt`]="{ item }">{{ item.createdAt | dateTime }}</template>

        <template v-slot:[`item.actions`]="{ item }">
          <!-- รออนุมัติ: อนุมัติ หรือ ปฏิเสธ (ลบผู้สมัคร) -->
          <template v-if="!item.approved">
            <v-btn small depressed rounded color="primary" :loading="busy === item._id" @click="approve(item)"><v-icon left small>mdi-check</v-icon>อนุมัติ</v-btn>
            <v-btn small text rounded color="error" class="ml-1" :disabled="busy === item._id" @click="ask('delete', item)">ปฏิเสธ</v-btn>
          </template>

          <!-- อนุมัติแล้ว: เมนูจัดการเพิ่มเติม (ไม่แสดงให้ตัวเอง เพราะ backend ห้ามทำกับตัวเอง) -->
          <v-menu v-else-if="!isMe(item)" offset-y left>
            <template v-slot:activator="{ on }">
              <v-btn icon small aria-label="จัดการ" v-on="on"><v-icon>mdi-dots-vertical</v-icon></v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="ask('role', item)">
                <v-list-item-icon><v-icon small>mdi-shield-account-outline</v-icon></v-list-item-icon>
                <v-list-item-title>{{ item.role === 'admin' ? 'ตั้งเป็นสมาชิก' : 'ตั้งเป็นผู้ดูแลระบบ' }}</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="item.role !== 'admin'" @click="ask('revoke', item)">
                <v-list-item-icon><v-icon small color="warning">mdi-account-lock-outline</v-icon></v-list-item-icon>
                <v-list-item-title>ระงับสิทธิ์</v-list-item-title>
              </v-list-item>
              <v-list-item @click="ask('delete', item)">
                <v-list-item-icon><v-icon small color="error">mdi-delete-outline</v-icon></v-list-item-icon>
                <v-list-item-title class="error--text">ลบผู้ใช้</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- ป๊อปอัปยืนยัน: ข้อความและสีเปลี่ยนตามการกระทำ (role / revoke / delete) -->
    <ConfirmDialog v-model="confirmOpen" :title="dialog.title" :confirm-text="dialog.button" :color="dialog.color" :icon="dialog.icon" :loading="busy === (target && target._id)" @confirm="run">
      {{ dialog.text }}
    </ConfirmDialog>
  </div>
</template>

<script>
import api, { imageUrl } from '../../api'
import ConfirmDialog from '../../components/ConfirmDialog.vue'

export default {
  components: { ConfirmDialog },
  data () {
    return {
      users: [],
      loading: true,
      error: '',
      search: '',
      filter: 'pending', // เปิดหน้ามาแสดงเฉพาะผู้ที่รออนุมัติก่อน (เรื่องที่ admin ต้องทำ)
      busy: '', // id ของผู้ใช้ที่กำลังทำรายการ (ใช้แสดงปุ่มหมุน)
      confirmOpen: false,
      action: '',
      target: null,
      filters: [
        { text: 'รออนุมัติ', value: 'pending' },
        { text: 'อนุมัติแล้ว', value: 'approved' },
        { text: 'ทั้งหมด', value: 'all' }
      ],
      headers: [
        { text: 'ผู้ใช้', value: 'name' },
        { text: 'อีเมล', value: 'email' },
        { text: 'บทบาท', value: 'role' },
        { text: 'สถานะ', value: 'approved' },
        { text: 'วันที่สมัคร', value: 'createdAt' },
        { text: '', value: 'actions', sortable: false, align: 'end' }
      ]
    }
  },
  computed: {
    me () { return this.$store.state.auth.user },
    pending () { return this.users.filter(u => !u.approved) },
    // รายการที่แสดงตามตัวกรองสถานะ
    shown () {
      if (this.filter === 'pending') return this.pending
      if (this.filter === 'approved') return this.users.filter(u => u.approved)
      return this.users
    },
    stats () {
      return [
        { label: 'ผู้ใช้ทั้งหมด', value: this.users.length, icon: 'mdi-account-group', color: 'primary' },
        { label: 'รออนุมัติ', value: this.pending.length, icon: 'mdi-account-clock', color: 'warning' },
        { label: 'อนุมัติแล้ว', value: this.users.length - this.pending.length, icon: 'mdi-account-check', color: 'success' }
      ]
    },
    // ข้อความในป๊อปอัปยืนยัน แยกตามการกระทำ
    dialog () {
      const name = this.target ? this.target.name : ''
      return {
        role: {
          title: this.target && this.target.role === 'admin' ? 'ตั้งเป็นสมาชิกทั่วไป?' : 'ตั้งเป็นผู้ดูแลระบบ?',
          text: this.target && this.target.role === 'admin' ? name + ' จะไม่สามารถจัดการร้านได้อีก' : name + ' จะสามารถจัดการสินค้า ออเดอร์ และผู้ใช้ได้ทั้งหมด',
          button: 'ยืนยัน', color: 'primary', icon: 'mdi-shield-account-outline'
        },
        revoke: { title: 'ระงับสิทธิ์ผู้ใช้?', text: name + ' จะกลับเป็น "รออนุมัติ" และเข้าสู่ระบบไม่ได้จนกว่าจะอนุมัติอีกครั้ง', button: 'ระงับสิทธิ์', color: 'warning', icon: 'mdi-account-lock-outline' },
        delete: { title: 'ลบผู้ใช้นี้?', text: 'ต้องการลบ ' + name + ' ใช่หรือไม่ การลบไม่สามารถย้อนกลับได้ (ผู้ที่เคยสั่งซื้อแล้วจะลบไม่ได้ ให้ใช้ระงับสิทธิ์แทน)', button: 'ลบผู้ใช้', color: 'error', icon: 'mdi-alert-outline' }
      }[this.action] || { title: '', text: '', button: 'ยืนยัน', color: 'primary', icon: 'mdi-alert-outline' }
    }
  },
  created () {
    this.load()
  },
  methods: {
    imageUrl,
    isMe (user) { return !!this.me && user._id === this.me._id },

    async load () {
      this.loading = true
      this.error = ''
      try {
        this.users = await api.get('/users')
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    // อัปเดตแถวของผู้ใช้ในตารางด้วยข้อมูลที่ backend ส่งกลับ (ไม่ต้องโหลดใหม่ทั้งหมด)
    replace (updated) {
      const i = this.users.findIndex(u => u._id === updated._id)
      if (i >= 0) this.$set(this.users, i, { ...this.users[i], ...updated })
    },

    async approve (user) {
      this.busy = user._id
      try {
        this.replace(await api.put('/users/' + user._id + '/approve'))
        this.$store.commit('notify', { text: 'อนุมัติ "' + user.name + '" แล้ว ผู้ใช้เข้าสู่ระบบได้ทันที' })
      } catch (e) {
        this.$store.commit('notify', { text: e.message, color: 'error' })
      } finally {
        this.busy = ''
      }
    },

    // เปิดป๊อปอัปยืนยันของการกระทำนั้น
    ask (action, user) {
      this.action = action
      this.target = user
      this.confirmOpen = true
    },

    // กดยืนยันในป๊อปอัป: เรียก API ตามการกระทำ
    async run () {
      const user = this.target
      this.busy = user._id
      try {
        if (this.action === 'role') {
          this.replace(await api.put('/users/' + user._id + '/role', { role: user.role === 'admin' ? 'user' : 'admin' }))
          this.$store.commit('notify', { text: 'เปลี่ยนบทบาทของ "' + user.name + '" แล้ว' })
        } else if (this.action === 'revoke') {
          this.replace(await api.put('/users/' + user._id + '/revoke'))
          this.$store.commit('notify', { text: 'ระงับสิทธิ์ "' + user.name + '" แล้ว', color: 'warning' })
        } else if (this.action === 'delete') {
          await api.delete('/users/' + user._id)
          this.users = this.users.filter(u => u._id !== user._id)
          this.$store.commit('notify', { text: 'ลบ "' + user.name + '" แล้ว', color: 'grey darken-2' })
        }
        this.confirmOpen = false
      } catch (e) {
        this.$store.commit('notify', { text: e.message, color: 'error' })
        this.confirmOpen = false
      } finally {
        this.busy = ''
      }
    }
  }
}
</script>

<style scoped>
.stat-value { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 600; }
.bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 14px 14px 4px; }
.search { max-width: 320px; }
</style>
