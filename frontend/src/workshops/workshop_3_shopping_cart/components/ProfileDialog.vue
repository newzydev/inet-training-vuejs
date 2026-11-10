<template>
  <!-- ป๊อปอัปโปรไฟล์: แก้ชื่อ เปลี่ยนรูป เปลี่ยนรหัสผ่าน (เรียก PUT /users/me และ /users/me/avatar) -->
  <v-dialog :value="value" max-width="460" persistent @input="$emit('input', $event)">
    <v-card class="profile">
      <!-- แบนเนอร์ด้านบน + รูปโปรไฟล์ (กดที่รูปเพื่อเปลี่ยน) -->
      <div class="banner">
        <label class="avatar-pick" title="เปลี่ยนรูปโปรไฟล์">
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden @change="pickAvatar">
          <v-avatar size="104" color="primary" class="avatar">
            <v-img v-if="preview" :src="preview" />
            <span v-else class="initial">{{ initial }}</span>
          </v-avatar>
          <span class="camera"><v-icon small color="white">mdi-camera</v-icon></span>
        </label>
      </div>

      <v-card-text class="pt-16">
        <div class="text-center mb-5">
          <div class="who">{{ user && user.name }}</div>
          <div class="caption grey--text">{{ user && user.email }}</div>
          <v-chip x-small class="mt-1" :color="isAdmin ? 'secondary' : 'primary'" dark>{{ isAdmin ? 'ผู้ดูแลระบบ' : 'สมาชิก' }}</v-chip>
        </div>

        <v-alert v-if="error" type="error" text dense>{{ error }}</v-alert>

        <!-- label อยู่ด้านบนช่องกรอก (คอมโพเนนต์ AppField ใน src/components) -->
        <AppField label="ชื่อ" field-id="profile-name">
          <v-text-field id="profile-name" v-model="name" outlined placeholder="ชื่อที่แสดง" prepend-inner-icon="mdi-account-outline" />
        </AppField>

        <!-- เปลี่ยนรหัสผ่าน: กางออกเมื่อต้องการเท่านั้น -->
        <v-btn text small color="primary" class="mb-2" @click="changePassword = !changePassword">
          <v-icon left small>mdi-lock-outline</v-icon>{{ changePassword ? 'ไม่เปลี่ยนรหัสผ่าน' : 'เปลี่ยนรหัสผ่าน' }}
        </v-btn>
        <v-expand-transition>
          <div v-show="changePassword">
            <AppField label="รหัสผ่านเดิม" field-id="profile-current">
              <v-text-field id="profile-current" v-model="currentPassword" type="password" outlined placeholder="รหัสผ่านที่ใช้อยู่ตอนนี้" />
            </AppField>
            <AppField label="รหัสผ่านใหม่" field-id="profile-new">
              <v-text-field id="profile-new" v-model="newPassword" type="password" outlined placeholder="อย่างน้อย 4 ตัวอักษร" />
            </AppField>
          </div>
        </v-expand-transition>
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn text :disabled="saving" @click="$emit('input', false)">ยกเลิก</v-btn>
        <v-btn depressed color="primary" :loading="saving" @click="save">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api, { imageUrl } from '../api'
import AppField from '@/components/AppField.vue'

export default {
  components: { AppField },
  props: { value: { type: Boolean, default: false } },
  data () {
    return { name: '', currentPassword: '', newPassword: '', changePassword: false, avatarFile: null, preview: '', saving: false, error: '' }
  },
  computed: {
    user () { return this.$store.state.auth.user },
    isAdmin () { return this.$store.getters['auth/isAdmin'] },
    initial () { return this.user ? this.user.name.charAt(0).toUpperCase() : '' }
  },
  watch: {
    // ทุกครั้งที่เปิดป๊อปอัป: เติมค่าปัจจุบัน ล้างช่องรหัสผ่าน
    value (open) {
      if (!open) return
      this.name = this.user.name
      this.currentPassword = ''
      this.newPassword = ''
      this.changePassword = false
      this.avatarFile = null
      this.preview = imageUrl(this.user.avatar)
      this.error = ''
    }
  },
  methods: {
    pickAvatar (e) {
      const file = e.target.files[0]
      if (!file) return
      this.avatarFile = file
      this.preview = URL.createObjectURL(file) // แสดงตัวอย่างก่อนบันทึก
    },

    async save () {
      this.error = ''
      const body = {}
      if (this.name.trim() !== this.user.name) body.name = this.name
      if (this.changePassword && (this.currentPassword || this.newPassword)) {
        body.currentPassword = this.currentPassword
        body.newPassword = this.newPassword
      }
      if (!Object.keys(body).length && !this.avatarFile) return this.$emit('input', false) // ไม่มีอะไรเปลี่ยน

      this.saving = true
      try {
        const patch = {}
        if (Object.keys(body).length) patch.name = (await api.put('/users/me', body)).name
        if (this.avatarFile) {
          const form = new FormData()
          form.append('avatar', this.avatarFile)
          patch.avatar = (await api.put('/users/me/avatar', form)).avatar
        }
        this.$store.commit('auth/updateUser', patch) // อัปเดตชื่อ/รูปบนแถบเมนูทันที
        this.$store.commit('notify', { text: 'บันทึกโปรไฟล์แล้ว' })
        this.$emit('input', false)
      } catch (e) {
        this.error = e.message
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style scoped>
.profile { overflow: hidden; border-radius: 24px !important; }
.banner {
  height: 96px;
  background:
    radial-gradient(circle at 20% 30%, rgba(236, 72, 153, 0.55), transparent 45%),
    linear-gradient(135deg, #312e81 0%, #4f46e5 60%, #7c3aed 100%);
  position: relative;
}
.avatar-pick { position: absolute; left: 50%; bottom: -52px; transform: translateX(-50%); cursor: pointer; }
.avatar { border: 4px solid #fff; box-shadow: 0 12px 28px -10px rgba(30, 27, 110, 0.5); }
.initial { color: #fff; font-family: var(--font-heading); font-size: 2.2rem; font-weight: 600; }
.camera {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ec4899;
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.who { font-family: var(--font-heading); font-size: 1.35rem; font-weight: 600; color: #1e1b4b; }
</style>
