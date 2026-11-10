<template>
  <!-- ฟอร์มเพิ่ม/แก้ไขสินค้า (ป๊อปอัป): product = null คือเพิ่มใหม่, มีค่าคือแก้ไข -->
  <v-dialog :value="value" max-width="520" persistent @input="$emit('input', $event)">
    <v-card class="pa-2">
      <v-card-title class="display-font">{{ product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" text dense>{{ error }}</v-alert>

        <v-form ref="form" @submit.prevent="save">
          <v-text-field v-model="form.name" label="ชื่อสินค้า" outlined dense :rules="[v => !!v || 'กรุณากรอกชื่อสินค้า']" />
          <v-textarea v-model="form.description" label="รายละเอียด" outlined dense rows="3" />
          <v-row dense>
            <v-col cols="6">
              <v-text-field v-model="form.price" label="ราคา (บาท)" type="number" min="0" outlined dense :rules="[priceRule]" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.stock" label="จำนวนสต็อก" type="number" min="0" outlined dense :rules="[stockRule]" />
            </v-col>
          </v-row>

          <!-- รูปสินค้า: เลือกไฟล์แล้วแสดงตัวอย่างก่อนบันทึก -->
          <v-file-input
            v-model="file"
            label="รูปสินค้า (jpg, png, webp, gif)"
            accept="image/png,image/jpeg,image/webp,image/gif"
            prepend-icon=""
            prepend-inner-icon="mdi-image-outline"
            outlined
            dense
            show-size
            @change="makePreview"
          />
          <v-img v-if="preview" :src="preview" max-height="160" contain class="rounded-lg grey lighten-4" />
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-spacer />
        <v-btn text :disabled="saving" @click="$emit('input', false)">ยกเลิก</v-btn>
        <v-btn depressed color="primary" :loading="saving" @click="save">บันทึก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api, { imageUrl } from '../api'

const empty = () => ({ name: '', description: '', price: '', stock: '' })

export default {
  props: {
    value: { type: Boolean, default: false }, // เปิด/ปิดป๊อปอัป (v-model)
    product: { type: Object, default: null }
  },
  data () {
    return { form: empty(), file: null, preview: '', saving: false, error: '' }
  },
  watch: {
    // ทุกครั้งที่เปิดป๊อปอัป: ใส่ค่าเดิมของสินค้า (ถ้าแก้ไข) หรือล้างให้ว่าง (ถ้าเพิ่มใหม่)
    value (open) {
      if (!open) return
      this.error = ''
      this.file = null
      const p = this.product
      this.form = p ? { name: p.name, description: p.description || '', price: p.price, stock: p.stock } : empty()
      this.preview = p ? imageUrl(p.image) : ''
      this.$nextTick(() => this.$refs.form && this.$refs.form.resetValidation())
    }
  },
  methods: {
    priceRule: (v) => (v !== '' && Number(v) >= 0) || 'ราคาต้องไม่ติดลบ',
    stockRule: (v) => (v !== '' && Number.isInteger(Number(v)) && Number(v) >= 0) || 'สต็อกต้องเป็นจำนวนเต็ม ไม่ติดลบ',

    makePreview (file) {
      this.preview = file ? URL.createObjectURL(file) : this.product ? imageUrl(this.product.image) : ''
    },

    // บันทึก: ส่งเป็น FormData เพราะมีไฟล์รูปแนบไปด้วย
    async save () {
      if (!this.$refs.form.validate()) return
      this.saving = true
      this.error = ''
      const body = new FormData()
      Object.keys(this.form).forEach(k => body.append(k, this.form[k]))
      if (this.file) body.append('image', this.file)

      try {
        if (this.product) await api.put('/products/' + this.product._id, body)
        else await api.post('/products', body)
        this.$emit('saved')
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
