<template>
  <v-container class="page-wrap">
    <div class="d-flex align-center flex-wrap mb-6">
      <div>
        <h1 class="page-title">จัดการสินค้า</h1>
        <p class="grey--text mb-0">เพิ่ม แก้ไข และลบสินค้าในร้าน</p>
      </div>
      <v-spacer />
      <v-btn depressed color="primary" @click="openForm(null)"><v-icon left>mdi-plus</v-icon>เพิ่มสินค้า</v-btn>
    </div>

    <v-alert v-if="error" type="error" text>
      {{ error }}
      <template v-slot:append><v-btn small text color="error" @click="load">ลองใหม่</v-btn></template>
    </v-alert>

    <v-card class="card pa-2">
      <v-card-title class="pb-0">
        <v-text-field v-model="search" placeholder="ค้นหาสินค้า..." prepend-inner-icon="mdi-magnify" hide-details outlined dense clearable class="search" />
      </v-card-title>

      <!-- ตารางสินค้า -->
      <v-data-table
        :headers="headers"
        :items="products"
        :search="search"
        :loading="loading"
        loading-text="กำลังโหลด..."
        no-data-text="ยังไม่มีสินค้า กดปุ่ม 'เพิ่มสินค้า' เพื่อเริ่มต้น"
      >
        <template v-slot:[`item.image`]="{ item }">
          <div class="thumb my-2"><ProductImage :product="item" /></div>
        </template>
        <template v-slot:[`item.name`]="{ item }">
          <div class="font-weight-medium">{{ item.name }}</div>
          <div class="caption grey--text">{{ item.description }}</div>
        </template>
        <template v-slot:[`item.price`]="{ item }">{{ item.price | baht }}</template>
        <template v-slot:[`item.stock`]="{ item }">
          <v-chip small :color="item.stock < 1 ? 'error' : item.stock <= 5 ? 'warning' : 'success'" text-color="white">{{ item.stock }}</v-chip>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon small color="primary" aria-label="แก้ไข" @click="openForm(item)"><v-icon>mdi-pencil-outline</v-icon></v-btn>
          <v-btn icon small color="error" aria-label="ลบ" @click="askDelete(item)"><v-icon>mdi-delete-outline</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- ป๊อปอัปฟอร์มเพิ่ม/แก้ไข -->
    <ProductFormDialog v-model="formOpen" :product="editing" @saved="onSaved" />

    <!-- ป๊อปอัปยืนยันการลบ -->
    <v-dialog v-model="deleteOpen" max-width="400">
      <v-card class="pa-2">
        <v-card-title class="display-font">ลบสินค้านี้?</v-card-title>
        <v-card-text>
          ต้องการลบ <b>{{ toDelete && toDelete.name }}</b> ใช่หรือไม่ การลบไม่สามารถย้อนกลับได้
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text :disabled="deleting" @click="deleteOpen = false">ยกเลิก</v-btn>
          <v-btn depressed color="error" :loading="deleting" @click="remove">ลบสินค้า</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from '@/api'
import ProductImage from '@/components/ProductImage.vue'
import ProductFormDialog from '@/components/ProductFormDialog.vue'

export default {
  components: { ProductImage, ProductFormDialog },
  data () {
    return {
      products: [],
      loading: true,
      error: '',
      search: '',
      formOpen: false,
      editing: null, // สินค้าที่กำลังแก้ไข (null = เพิ่มใหม่)
      deleteOpen: false,
      toDelete: null,
      deleting: false,
      headers: [
        { text: 'รูป', value: 'image', sortable: false, width: 90 },
        { text: 'สินค้า', value: 'name' },
        { text: 'ราคา', value: 'price', align: 'end' },
        { text: 'สต็อก', value: 'stock', align: 'center' },
        { text: '', value: 'actions', sortable: false, align: 'end' }
      ]
    }
  },
  created () {
    this.load()
  },
  methods: {
    async load () {
      this.loading = true
      this.error = ''
      try {
        this.products = await api.get('/products')
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    openForm (product) {
      this.editing = product
      this.formOpen = true
    },
    onSaved () {
      this.$store.commit('notify', { text: this.editing ? 'แก้ไขสินค้าแล้ว' : 'เพิ่มสินค้าแล้ว' })
      this.load()
    },
    askDelete (product) {
      this.toDelete = product
      this.deleteOpen = true
    },
    async remove () {
      this.deleting = true
      try {
        await api.delete('/products/' + this.toDelete._id)
        this.$store.commit('notify', { text: 'ลบสินค้าแล้ว', color: 'grey darken-2' })
        this.deleteOpen = false
        this.load()
      } catch (e) {
        this.$store.commit('notify', { text: e.message, color: 'error' })
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>

<style scoped>
.thumb { width: 64px; border-radius: 12px; overflow: hidden; }
.search { max-width: 360px; }
</style>
