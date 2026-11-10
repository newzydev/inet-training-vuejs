<template>
  <!-- ช่องกรอกแบบมาตรฐานของทั้งเว็บ: label อยู่ด้านบน แล้วตามด้วยช่องกรอก (ไม่ใช้ label ลอยบนขอบกรอบ)
       ใช้ครอบ v-text-field / v-textarea / v-file-input:
       <AppField label="อีเมล" field-id="email" required>
         <v-text-field id="email" v-model="email" outlined placeholder="you@example.com" />
       </AppField>
       ใส่ id ที่ช่องกรอกให้ตรงกับ field-id เพื่อให้กดที่ label แล้วโฟกัสช่องได้ -->
  <div class="app-field">
    <label v-if="label" :for="fieldId" class="field-label">{{ label }}<span v-if="required" class="req">*</span></label>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String, default: '' },
    fieldId: { type: String, default: '' }, // id ของช่องกรอกที่ label นี้อ้างถึง (ใส่ id เดียวกันที่ช่องกรอก)
    required: { type: Boolean, default: false } // แสดงดอกจันสีแดงต่อท้าย label
  }
}
</script>

<style scoped>
.field-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}
.req { margin-left: 3px; color: #ef4444; }

/* หน้าตาของช่องกรอก (>>> = ใช้กับคอมโพเนนต์ Vuetify ที่อยู่ข้างใน): พื้นอ่อน มุมมน ขอบบาง โฟกัสแล้วมีวงเรืองแสง */
.app-field >>> .v-text-field--outlined > .v-input__control > .v-input__slot {
  min-height: 52px;
  border-radius: 14px;
  background: #faf9ff;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}
.app-field >>> .v-text-field--outlined fieldset {
  border: 1.5px solid #e0e2f2;
  border-radius: 14px;
}
.app-field >>> .v-text-field--outlined:not(.v-input--is-focused):not(.error--text):hover fieldset { border-color: #c4c7ea; }
.app-field >>> .v-text-field--outlined.v-input--is-focused fieldset { border: 2px solid #6366f1; }
.app-field >>> .v-text-field--outlined.v-input--is-focused > .v-input__control > .v-input__slot {
  background: #fff;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.14);
}
.app-field >>> .v-text-field--outlined.error--text fieldset { border-color: #ef4444; }
.app-field >>> .v-text-field input::placeholder,
.app-field >>> .v-text-field textarea::placeholder { color: #a3a6c2; opacity: 1; }
/* ไอคอนหน้าช่อง */
.app-field >>> .v-input__prepend-inner .v-icon { color: #818cf8; }
/* เว้นระยะไอคอนจากขอบซ้ายและจากข้อความ ไม่ให้ชิดเกินไป */
.app-field >>> .v-text-field--outlined .v-input__prepend-inner { margin-top: 0; padding-right: 14px !important; align-self: center; }
.app-field >>> .v-text-field--outlined > .v-input__control > .v-input__slot { padding-left: 18px !important; padding-right: 14px !important; }
</style>
