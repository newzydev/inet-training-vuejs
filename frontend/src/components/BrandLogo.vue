<template>
  <!-- โลโก้ "นิว.xxx" ใช้ร่วมกันทุก Workshop (ขนาด ฟอนต์ สี เหมือนกันหมด)
       <BrandLogo suffix="dev" href="#home" />        ลิงก์ธรรมดา (เลื่อนไปหัวข้อ)
       <BrandLogo suffix="shop" to="/workshop-3" dark />  ลิงก์ของ router (dark = ใช้บนพื้นขาว)
       ถ้าไม่ใส่ href/to จะเป็นข้อความเฉย ๆ -->
  <component :is="tag" v-bind="linkProps" class="brand-logo" :class="{ dark: dark }">{{ name }}<span>.{{ suffix }}</span></component>
</template>

<script>
export default {
  props: {
    name: { type: String, default: 'นิว' },
    suffix: { type: String, required: true }, // dev / grade / shop
    href: { type: String, default: '' },
    to: { type: String, default: '' },
    dark: { type: Boolean, default: false } // true = ตัวอักษรเข้ม (ใช้บนพื้นสีอ่อน), false = ตัวอักษรขาว (ใช้บนพื้นไล่สี)
  },
  computed: {
    tag () { return this.to ? 'router-link' : this.href ? 'a' : 'div' },
    linkProps () { return this.to ? { to: this.to } : this.href ? { href: this.href } : {} }
  }
}
</script>

<style scoped>
/* .v-application นำหน้าเพื่อชนะสีลิงก์เริ่มต้นของ Vuetify (CSS ของคอมโพเนนต์ถูกใส่ก่อน CSS ของ Vuetify) */
.v-application .brand-logo {
  display: inline-block;
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
}
.v-application .brand-logo span { color: #f9a8d4; }
.v-application .brand-logo.dark { color: #1e1b4b; }
.v-application .brand-logo.dark span { color: #ec4899; }
</style>
