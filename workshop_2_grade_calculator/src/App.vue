<template>
  <v-app>
    <v-main>
      <!-- ================= ส่วนหัว ================= -->
      <header class="hero">
        <!-- ชื่อแบรนด์มุมซ้ายบน -->
        <div class="brand">นิว<span>.grade</span></div>
        <v-icon size="44" color="white" class="mb-3">mdi-school</v-icon>
        <h1 class="hero-title">โปรแกรมตัดเกรด</h1>
        <p class="hero-sub">กรอกคะแนน 0 - 100 แล้วกดปุ่มเพื่อดูเกรดที่ได้</p>
      </header>

      <v-container class="content">
        <v-row>
          <!-- ================= ฝั่งซ้าย : กรอกคะแนน + ผลลัพธ์ ================= -->
          <v-col cols="12" md="7">
            <v-card class="card pa-8" outlined>
              <h2 class="card-title">กรอกคะแนน</h2>

              <!-- v-model : ผูกค่าที่พิมพ์กับตัวแปร score (สองทาง)
                   @keyup.enter : กด Enter เพื่อตัดเกรดได้เหมือนกดปุ่ม
                   :error-messages : แสดงข้อความ error ใต้ช่องกรอก -->
              <div class="field-label">คะแนนที่ได้ (0 - 100)</div>
              <v-text-field
                v-model="score"
                class="score-input"
                placeholder="0"
                prepend-inner-icon="mdi-pencil-outline"
                suffix="/ 100"
                inputmode="decimal"
                outlined
                rounded
                clearable
                autofocus
                :error-messages="errorMessage"
                @keyup.enter="calculate"
                @input="errorMessage = ''"
              />

              <div class="d-flex">
                <v-btn large rounded depressed color="primary" class="btn-main" @click="calculate">
                  <v-icon left>mdi-calculator</v-icon>ตัดเกรด
                </v-btn>
                <v-btn large rounded outlined color="primary" class="ml-3" @click="reset">ล้างค่า</v-btn>
              </div>

              <!-- ผลลัพธ์ : v-if แสดงเมื่อคำนวณสำเร็จแล้วเท่านั้น -->
              <v-fade-transition mode="out-in">
                <div v-if="grade" :key="grade" class="result">
                  <div class="grade-circle" :style="{ background: gradeInfo.color }">{{ grade }}</div>
                  <div>
                    <div class="result-title">ได้เกรด {{ grade }}</div>
                    <div class="result-desc">คะแนน {{ shownScore }} · {{ gradeInfo.message }}</div>
                  </div>
                </div>
                <div v-else key="empty" class="result empty">
                  <v-icon size="40" color="grey lighten-1" class="mr-4">mdi-text-box-search-outline</v-icon>
                  <div class="grey--text">ผลลัพธ์จะแสดงที่นี่ หลังกดปุ่ม "ตัดเกรด"</div>
                </div>
              </v-fade-transition>
            </v-card>
          </v-col>

          <!-- ================= ฝั่งขวา : เกณฑ์เกรด ================= -->
          <v-col cols="12" md="5">
            <v-card class="card pa-8" outlined height="100%">
              <h2 class="card-title">เกณฑ์การตัดเกรด</h2>
              <!-- ส่งข้อมูลเข้า component ลูกด้วย props -->
              <GradeScale :scale="gradeScale" :active="grade" />
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <!-- แจ้งเตือนแบบป๊อปอัป เมื่อกรอกข้อมูลไม่ถูกต้อง -->
    <v-snackbar v-model="showAlert" color="error" top timeout="3500">
      <v-icon left color="white">mdi-alert-circle</v-icon>{{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showAlert = false">ปิด</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import GradeScale from '@/components/GradeScale.vue'

export default {
  components: { GradeScale },

  // data() = ตัวแปรของหน้านี้
  data () {
    return {
      score: '', // ค่าที่ผู้ใช้พิมพ์ (เก็บเป็นข้อความ)
      shownScore: null, // คะแนนที่ใช้คำนวณล่าสุด (แสดงในผลลัพธ์)
      grade: '', // เกรดที่ได้ ('' = ยังไม่คำนวณ)
      errorMessage: '', // ข้อความแจ้งเตือน
      showAlert: false, // เปิด/ปิด snackbar
      // เกณฑ์เกรดจากโจทย์ เรียงจากสูงไปต่ำ
      gradeScale: [
        { grade: 'A', min: 80, max: 100, color: '#16a34a', message: 'ยอดเยี่ยมมาก!' },
        { grade: 'B', min: 70, max: 79, color: '#0891b2', message: 'ดีมาก' },
        { grade: 'C', min: 60, max: 69, color: '#d97706', message: 'พอใช้' },
        { grade: 'D', min: 50, max: 59, color: '#ea580c', message: 'ต้องพยายามอีกนิด' },
        { grade: 'F', min: 0, max: 49, color: '#dc2626', message: 'ยังไม่ผ่านเกณฑ์' }
      ]
    }
  },

  // computed = ค่าที่คำนวณจากตัวแปรอื่น (อัปเดตอัตโนมัติ)
  computed: {
    // ข้อมูลของเกรดที่ได้ (สี ข้อความ) ใช้ตอนแสดงผล
    gradeInfo () {
      return this.gradeScale.find(item => item.grade === this.grade) || {}
    }
  },

  methods: {
    // กดปุ่ม "ตัดเกรด"
    calculate () {
      const text = String(this.score || '').trim()

      // 1) ตรวจว่าเป็นตัวเลขหรือไม่ (ไม่รับตัวอักษร, ค่าว่าง, เครื่องหมายลบ)
      if (!/^\d+(\.\d+)?$/.test(text)) {
        return this.fail('กรุณากรอกคะแนนเป็นตัวเลขเท่านั้น')
      }

      // 2) ตรวจว่าอยู่ในช่วง 0 - 100 หรือไม่
      const value = Number(text)
      if (value < 0 || value > 100) {
        return this.fail('คะแนนต้องอยู่ในช่วง 0 - 100')
      }

      // 3) ตัดเกรดจากเกณฑ์ (ใช้ "ตั้งแต่เท่าไรขึ้นไป" เพื่อรองรับทศนิยม เช่น 79.5)
      this.errorMessage = ''
      this.shownScore = value
      this.grade = this.gradeScale.find(item => value >= item.min).grade
    },

    // แจ้งเตือนเมื่อกรอกไม่ถูกต้อง และล้างผลลัพธ์เดิม
    fail (message) {
      this.grade = ''
      this.errorMessage = message
      this.showAlert = true
    },

    // กดปุ่ม "ล้างค่า"
    reset () {
      this.score = ''
      this.grade = ''
      this.errorMessage = ''
    }
  }
}
</script>

<style>
/* ฟอนต์เนื้อหา = IBM Plex Sans Thai / ฟอนต์หัวข้อ = Kanit */
.v-application { font-family: 'IBM Plex Sans Thai', sans-serif !important; }
.v-application .hero-title,
.v-application .card-title,
.v-application .result-title,
.v-application .grade-circle {
  font-family: 'Kanit', sans-serif !important;
}
.v-application.theme--light { background: #f1effb !important; }

/* ---------- ส่วนหัว ---------- */
.v-application .brand {
  position: absolute;
  top: 24px;
  left: 32px;
  font-family: 'Kanit', sans-serif !important;
  font-size: 1.5rem;
  font-weight: 700;
}
.brand span { color: #f9a8d4; }
.hero {
  position: relative;
  text-align: center;
  color: #fff;
  padding: 72px 16px 120px;
  background:
    radial-gradient(circle at 15% 20%, rgba(236, 72, 153, 0.5), transparent 40%),
    radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.4), transparent 40%),
    linear-gradient(135deg, #1e1b6e 0%, #4f46e5 55%, #7c3aed 100%);
}
.hero-title { font-size: 2.6rem; font-weight: 600; }
.hero-sub { opacity: 0.85; margin: 6px 0 0; font-size: 1.05rem; }

/* ---------- เนื้อหา ---------- */
.content { max-width: 1000px; margin-top: -72px; position: relative; }
.card {
  border-radius: 20px !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 20px 45px -24px rgba(79, 70, 229, 0.45) !important;
}
.card-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 20px; }
.btn-main { box-shadow: 0 10px 24px -10px rgba(79, 70, 229, 0.8) !important; }

/* ---------- ช่องกรอกคะแนน ---------- */
.field-label { font-weight: 500; margin-bottom: 10px; opacity: 0.75; }
/* ขนาดและพื้นหลังของช่อง */
.score-input .v-input__slot {
  min-height: 72px !important;
  padding: 0 24px !important;
  background: #f5f3ff !important;
  transition: box-shadow 0.25s ease;
}
/* ตัวเลขที่พิมพ์ : ใหญ่ ใช้ฟอนต์ Kanit */
.v-application .score-input input {
  font-family: 'Kanit', sans-serif !important;
  font-size: 2rem;
  font-weight: 500;
  color: #1e1b4b;
  caret-color: #4f46e5;
}
.score-input input::placeholder { color: #c4b5fd; opacity: 1; }
.score-input .v-text-field__suffix {
  font-size: 1.1rem;
  font-weight: 500;
  color: #9ca3af;
  padding-left: 8px;
}
/* ไอคอนด้านหน้า : จัดให้อยู่กึ่งกลางแนวตั้งของช่อง */
.score-input .v-input__prepend-inner {
  align-self: center !important;
  margin-top: 0 !important;
  padding-right: 14px;
}
.score-input .v-input__prepend-inner .v-icon { color: #818cf8; font-size: 26px; }
.score-input .v-input__append-inner { align-self: center !important; margin-top: 0 !important; }
/* เส้นขอบ : สีอ่อนปกติ, เข้มขึ้นเมื่อโฟกัส พร้อมวงเรืองแสง */
.score-input.v-text-field--outlined fieldset { border: 2px solid #e0e7ff; }
.score-input.v-input--is-focused .v-input__slot {
  background: #fff !important;
  box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.16);
}
.score-input.v-input--is-focused fieldset { border-color: #6366f1; }
.score-input.error--text .v-input__slot { background: #fef2f2 !important; }

/* ---------- ผลลัพธ์ ---------- */
.result {
  display: flex;
  align-items: center;
  margin-top: 28px;
  padding: 22px;
  border-radius: 18px;
  background: #f5f3ff;
}
.result.empty { background: #f9fafb; border: 1px dashed #d1d5db; }
.grade-circle {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  margin-right: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2.8rem;
  font-weight: 600;
  box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.45);
}
.result-title { font-size: 1.5rem; font-weight: 600; }
.result-desc { opacity: 0.7; }

@media (max-width: 600px) {
  .hero { padding-top: 56px; }
  .hero-title { font-size: 2rem; }
}
</style>
