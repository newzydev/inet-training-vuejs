<template>
  <!-- ฟอร์มเพิ่ม/แก้ไขสินค้า (ป๊อปอัป): product = null คือเพิ่มใหม่, มีค่าคือแก้ไข -->
  <v-dialog :value="value" max-width="520" persistent @input="$emit('input', $event)">
    <v-card class="pa-2">
      <v-card-title class="display-font">{{ product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" text dense>{{ error }}</v-alert>

        <v-form ref="form" @submit.prevent="save">
          <!-- label อยู่ด้านบนช่องกรอก (คอมโพเนนต์ AppField ใน src/shell) -->
          <AppField label="ชื่อสินค้า" field-id="p-name" required>
            <v-text-field id="p-name" v-model="form.name" outlined placeholder="เช่น หูฟังไร้สาย" :rules="[v => !!v || 'กรุณากรอกชื่อสินค้า']" />
          </AppField>
          <AppField label="รายละเอียด" field-id="p-desc">
            <v-textarea id="p-desc" v-model="form.description" outlined rows="3" placeholder="อธิบายสินค้าสั้น ๆ" />
          </AppField>
          <v-row dense>
            <v-col cols="6">
              <AppField label="ราคา (บาท)" field-id="p-price" required>
                <v-text-field id="p-price" v-model="form.price" type="number" min="0" outlined placeholder="0" :rules="[priceRule]" />
              </AppField>
            </v-col>
            <v-col cols="6">
              <AppField label="จำนวนสต็อก" field-id="p-stock" required>
                <v-text-field id="p-stock" v-model="form.stock" type="number" min="0" outlined placeholder="0" :rules="[stockRule]" />
              </AppField>
            </v-col>
          </v-row>

          <!-- รูปสินค้า: เลือกไฟล์แล้วแสดงตัวอย่างก่อนบันทึก -->
          <AppField label="รูปสินค้า" field-id="p-image">
            <v-file-input
              id="p-image"
              v-model="file"
              placeholder="เลือกไฟล์ (jpg, png, webp, gif)"
              accept="image/png,image/jpeg,image/webp,image/gif"
              prepend-icon=""
              prepend-inner-icon="mdi-image-outline"
              outlined
              show-size
              @change="makePreview"
            />
          </AppField>
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
import AppField from '@/shell/AppField.vue'

const empty = () => ({ name: '', description: '', price: '', stock: '' })

export default {
  components: { AppField },
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
