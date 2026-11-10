<template>
  <div class="w1">
    <!-- ================= Navbar ================= -->
    <!-- scrolled = true เมื่อเลื่อนหน้าลง -> navbar เปลี่ยนเป็นพื้นขาว -->
    <v-app-bar app :flat="!scrolled" :color="scrolled ? 'white' : 'transparent'" :dark="!scrolled" height="68" class="nav-bar" :class="{ scrolled: scrolled }">
      <v-container class="d-flex align-center py-0">
        <!-- โลโก้ใช้คอมโพเนนต์กลาง (หน้าตาเหมือนทุก Workshop): พื้นขาวหลังเลื่อนหน้า -> ใช้ตัวอักษรเข้ม -->
        <BrandLogo :name="profile.nickname" suffix="dev" href="#home" :dark="scrolled" />
        <v-spacer />

        <!-- เมนูบนจอใหญ่ : v-for วนจากข้อมูล menus -->
        <div class="d-none d-md-flex">
          <!-- active = หัวข้อที่กำลังดูอยู่ (scroll-spy: คำนวณใน onScroll) -->
          <v-btn v-for="m in menus" :key="m.href" text rounded :href="m.href" class="nav-link" :class="{ active: active === m.href }">{{ m.title }}</v-btn>
        </div>

        <!-- เมนูบนมือถือ -->
        <v-menu offset-y class="d-md-none">
          <template v-slot:activator="{ on }">
            <v-btn icon class="d-md-none" v-on="on"><v-icon>mdi-menu</v-icon></v-btn>
          </template>
          <v-list>
            <v-list-item v-for="m in menus" :key="m.href" :href="m.href" :class="{ 'active-item': active === m.href }">
              <v-list-item-title>{{ m.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-container>
    </v-app-bar>

      <!-- ================= Hero ================= -->
      <section id="home" class="hero">
        <v-container class="hero-inner">
          <!-- รูปโปรไฟล์ : :src ผูกกับตัวแปร profile.photo (ไฟล์อยู่ใน src/assets) -->
          <v-avatar size="150" class="avatar mb-6">
            <v-img :src="profile.photo" :alt="profile.nameEn" />
          </v-avatar>
          <div class="hello">สวัสดีครับ ผมชื่อ{{ profile.nickname }}</div>
          <h1 class="hero-name">{{ profile.name }}</h1>
          <div class="hero-role">{{ profile.role }}</div>
          <p class="hero-desc">{{ profile.intro }}</p>

          <div class="mt-8">
            <v-btn large rounded color="white" class="indigo--text mr-3 mb-2" href="#projects">
              ดูผลงาน<v-icon right>mdi-arrow-down</v-icon>
            </v-btn>
            <v-btn large rounded outlined dark class="mb-2" :href="'https://' + profile.github" target="_blank">
              <v-icon left>mdi-github</v-icon>GitHub
            </v-btn>
          </div>

          <!-- สถิติ : ค่าตัวเลขคำนวณจากข้อมูลด้วย computed -->
          <div class="stats">
            <div v-for="s in stats" :key="s.label" class="stat">
              <div class="stat-num">{{ s.value }}</div>
              <div class="stat-label">{{ s.label }}</div>
            </div>
          </div>
        </v-container>
      </section>

      <!-- ================= เกี่ยวกับฉัน ================= -->
      <section id="about" class="section">
        <v-container>
          <SectionTitle label="About" title="เกี่ยวกับฉัน" />
          <v-row>
            <!-- ข้อมูลส่วนตัว -->
            <v-col cols="12" md="5">
              <v-card class="card pa-6" outlined>
                <h3 class="card-title">ข้อมูลส่วนตัว</h3>
                <div v-for="p in personal" :key="p.label" class="info-row">
                  <span class="info-label">{{ p.label }}</span>
                  <span class="info-value">{{ p.value }}</span>
                </div>
              </v-card>
            </v-col>
            <!-- คุณสมบัติส่วนตัว -->
            <v-col cols="12" md="7">
              <v-row>
                <v-col v-for="q in qualities" :key="q.text" cols="12" sm="6">
                  <v-card class="card pa-5 text-center" outlined height="100%">
                    <v-avatar size="52" class="icon-box mb-3">
                      <v-icon color="white">{{ q.icon }}</v-icon>
                    </v-avatar>
                    <div>{{ q.text }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= ประสบการณ์ & การศึกษา ================= -->
      <section id="experience" class="section alt">
        <v-container>
          <SectionTitle label="Experience & Education" title="ประสบการณ์และการศึกษา" />
          <v-row>
            <v-col cols="12" md="6">
              <h3 class="col-heading"><v-icon color="primary" class="mr-2">mdi-briefcase</v-icon>ประสบการณ์ทำงาน</h3>
              <v-card v-for="job in experience" :key="job.org" class="card pa-6 mb-4" outlined>
                <div class="job-role">{{ job.role }}</div>
                <div class="grey--text text--darken-1">{{ job.org }}</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <h3 class="col-heading"><v-icon color="primary" class="mr-2">mdi-school</v-icon>ประวัติการศึกษา</h3>
              <!-- v-timeline : เส้นเวลาแนวตั้ง -->
              <v-timeline dense align-top class="timeline">
                <v-timeline-item v-for="e in education" :key="e.school" small color="primary">
                  <div class="period" v-if="e.period">{{ e.period }}</div>
                  <div class="job-role">{{ e.school }}</div>
                  <div class="grey--text text--darken-1" v-if="e.detail">{{ e.detail }}</div>
                </v-timeline-item>
              </v-timeline>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= ผลงาน ================= -->
      <section id="projects" class="section">
        <v-container>
          <SectionTitle label="Projects" title="ผลงาน" />
          <v-row>
            <v-col v-for="p in projects" :key="p.short" cols="12" sm="6" md="4">
              <v-card class="card project pa-6" outlined height="100%">
                <v-avatar size="52" :color="p.color" class="mb-4">
                  <v-icon color="white">{{ p.icon }}</v-icon>
                </v-avatar>
                <div class="job-role">{{ p.name }}</div>
                <v-chip small label class="mt-3" color="indigo lighten-5">{{ p.short }}</v-chip>
              </v-card>
            </v-col>
          </v-row>
          <div class="text-center mt-8">
            <v-btn rounded outlined color="primary" :href="'https://' + profile.github" target="_blank">
              <v-icon left>mdi-github</v-icon>ดูผลงานบน GitHub
            </v-btn>
          </div>
        </v-container>
      </section>

      <!-- ================= ทักษะ ================= -->
      <section id="skills" class="section alt">
        <v-container>
          <SectionTitle label="Skills" title="ทักษะความสามารถ" />
          <v-row>
            <v-col v-for="group in skills" :key="group.title" cols="12" md="4">
              <v-card class="card pa-6" outlined height="100%">
                <h3 class="card-title"><v-icon color="primary" class="mr-2">{{ group.icon }}</v-icon>{{ group.title }}</h3>
                <v-chip v-for="s in group.items" :key="s" label class="mr-2 mb-2" color="indigo lighten-5">{{ s }}</v-chip>
              </v-card>
            </v-col>
          </v-row>

          <!-- ภาษา : แถบแสดงระดับ -->
          <v-row justify="center" class="mt-6">
            <v-col v-for="l in languages" :key="l.name" cols="12" sm="6" md="4">
              <div class="d-flex justify-space-between mb-1">
                <b>{{ l.name }}</b><span class="grey--text">{{ l.level }}</span>
              </div>
              <!-- :value = bind ตัวเลขเข้ากับแถบ -->
              <v-progress-linear :value="l.percent" color="primary" height="8" rounded />
            </v-col>
          </v-row>
        </v-container>
      </section>


    <!-- ================= Footer ================= -->
    <v-footer color="#1e1b4b" dark class="justify-center text-center py-6">
      © 2026 {{ profile.name }} · สร้างด้วย Vue.js + Vuetify · INET Training Workshop 1
    </v-footer>
  </div>
</template>

<script>
import SectionTitle from './components/SectionTitle.vue'
import BrandLogo from '@/shell/BrandLogo.vue'

export default {
  components: { SectionTitle, BrandLogo },

  // data() = ตัวแปรของหน้านี้ ข้อมูลทั้งหมดมาจากเรซูเม่ แก้ตรงนี้ที่เดียวหน้าเว็บอัปเดตเอง
  data () {
    return {
      scrolled: false, // เลื่อนหน้าลงหรือยัง (ใช้เปลี่ยนสี navbar)
      active: '', // หัวข้อที่กำลังดูอยู่ เช่น '#about' (ใช้ไฮไลต์เมนู; '' = ยังอยู่ที่ Hero ด้านบนสุด)
      profile: {
        name: 'ศักดา สุขขวัญ',
        nameEn: 'Sakdar Sukkwan',
        nickname: 'นิว',
        role: 'Software Engineer',
        photo: require('./assets/profile.webp'),
        intro: 'Software Engineer ที่ บริษัท อินเทอร์เน็ตประเทศไทย จำกัด (มหาชน)',
        github: 'github.com/newzydev'
      },
      menus: [
        { title: 'เกี่ยวกับ', href: '#about' },
        { title: 'ประสบการณ์', href: '#experience' },
        { title: 'ผลงาน', href: '#projects' },
        { title: 'ทักษะ', href: '#skills' }
      ],
      personal: [
        { label: 'ชื่อ-สกุล', value: 'ศักดา สุขขวัญ' },
        { label: 'ชื่อเล่น', value: 'นิว' },
        { label: 'ตำแหน่ง', value: 'Software Engineer' },
        { label: 'บริษัท', value: 'อินเทอร์เน็ตประเทศไทย (INET)' }
      ],
      qualities: [
        { icon: 'mdi-account-group', text: 'มีมนุษยสัมพันธ์ดี ทำงานร่วมกับทีมได้' },
        { icon: 'mdi-shield-check', text: 'มีความรับผิดชอบ ขยันทำงาน' },
        { icon: 'mdi-speedometer', text: 'ทำงานภายใต้แรงกดดันได้' },
        { icon: 'mdi-lightbulb-on', text: 'แก้ปัญหาเฉพาะหน้าได้' }
      ],
      experience: [
        {
          role: 'Software Engineer',
          org: 'บริษัท อินเทอร์เน็ตประเทศไทย จำกัด (มหาชน)'
        },
        {
          role: 'Software Developer',
          org: 'สำนักนวัตกรรมดิจิทัลและระบบอัจฉริยะ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตหาดใหญ่'
        }
      ],
      education: [
        {
          period: '2566 - 2568',
          school: 'มหาวิทยาลัยสงขลานครินทร์',
          detail: 'ปริญญาตรี คณะวิทยาศาสตร์ สาขาวิทยาการคำนวณ หลักสูตรเทคโนโลยีสารสนเทศ'
        },
        {
          period: '2561 - 2566',
          school: 'วิทยาลัยเทคโนโลยีพณิชยการหาดใหญ่',
          detail: 'สาขาเทคโนโลยีธุรกิจดิจิทัล'
        }
      ],
      projects: [
        { icon: 'mdi-dumbbell', color: '#4f46e5', short: 'PSU Sports', name: 'ระบบสารสนเทศ ศูนย์กีฬาและสุขภาพ ม.อ.' },
        { icon: 'mdi-store', color: '#7c3aed', short: 'MyPOSMS', name: 'ระบบจัดการหน้าร้าน' },
        { icon: 'mdi-wrench', color: '#0891b2', short: 'Computer Repair', name: 'ระบบแจ้งซ่อมคอมพิวเตอร์' },
        { icon: 'mdi-silverware-fork-knife', color: '#ea580c', short: 'RES Management', name: 'ระบบจัดการร้านอาหาร' },
        { icon: 'mdi-bank-transfer', color: '#16a34a', short: 'EMT', name: 'ระบบการทำธุรกรรมการเงินอิเล็กทรอนิกส์' },
        { icon: 'mdi-school', color: '#db2777', short: 'DBT E-Learning', name: 'ระบบการเรียนรู้และแบบทดสอบออนไลน์' }
      ],
      skills: [
        {
          title: 'การเขียนโปรแกรม',
          icon: 'mdi-code-tags',
          items: ['C', 'C++', 'C#', '.NET', 'Java', 'JavaScript', 'PHP', 'EJS', 'React', 'MySQL', 'PostgreSQL']
        },
        { title: 'โปรแกรมพื้นฐาน', icon: 'mdi-microsoft-office', items: ['Word', 'PowerPoint', 'Excel', 'Access'] },
        { title: 'ออกแบบ', icon: 'mdi-palette', items: ['Photoshop', 'Illustrator', 'Audition'] }
      ],
      languages: [
        { name: 'ไทย', level: 'ดีเยี่ยม', percent: 100 },
        { name: 'English', level: 'ปานกลาง', percent: 60 }
      ]
    }
  },

  // computed = ค่าที่คำนวณจากข้อมูลอื่น (อัปเดตอัตโนมัติเมื่อ data เปลี่ยน)
  computed: {
    // ตัวเลขสถิติใน Hero นับจากจำนวนข้อมูลจริง
    stats () {
      return [
        { value: this.projects.length, label: 'ผลงานระบบ' },
        { value: this.skills[0].items.length, label: 'ทักษะโปรแกรมมิ่ง' },
        { value: this.languages.length, label: 'ภาษา' }
      ]
    }
  },

  // lifecycle : ผูก/ยกเลิกการฟังเหตุการณ์เลื่อนหน้าจอ
  mounted () {
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll() // คำนวณสถานะเริ่มต้นทันที (เผื่อเปิดหน้ามากลางหน้า เช่น ลิงก์ #skills)
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll () {
      this.scrolled = window.scrollY > 40

      // scroll-spy: หัวข้อสุดท้ายที่เลื่อนผ่านเส้นอ้างอิง (ใต้ navbar ลงมา 140px) คือหัวข้อที่กำลังดูอยู่
      let current = ''
      for (const m of this.menus) {
        const el = document.querySelector(m.href)
        if (el && el.getBoundingClientRect().top <= 140) current = m.href
      }
      // เลื่อนจนสุดหน้า: ถือว่าอยู่หัวข้อสุดท้าย (หัวข้อท้ายสุดอาจสูงไม่พอให้ผ่านเส้นอ้างอิง)
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = this.menus[this.menus.length - 1].href
      }
      this.active = current
    }
  }
}
</script>

<style lang="scss">
/* ทุกสไตล์อยู่ใต้ .w1 เพื่อไม่ชนกับ Workshop อื่นในแอปเดียวกัน */
.w1 {
/* ฟอนต์เนื้อหา = IBM Plex Sans Thai / ฟอนต์หัวข้อ = Kanit  และเลื่อนหน้าแบบนุ่มนวลเมื่อกดเมนู */
.hero-name,
.hero-role,
.stat-num,
.card-title,
.col-heading,
.job-role {
  font-family: var(--font-heading) !important;
}

/* ---------- Navbar: เมนูที่ตรงกับหัวข้อที่กำลังดูอยู่ (scroll-spy) ---------- */
.nav-link { font-weight: 500; letter-spacing: 0; }
.nav-link::before { transition: opacity 0.2s ease; }
/* navbar โปร่งใสบนพื้นไล่สี: เมนู active = เม็ดยาสีขาวโปร่ง */
.nav-link.active { background: rgba(255, 255, 255, 0.22); }
.nav-link.active::before { opacity: 0; }
/* หลังเลื่อนหน้า navbar เป็นพื้นขาว: เมนู active = เม็ดยาสีม่วงอ่อน ตัวอักษรสีหลัก */
.nav-bar.scrolled .nav-link.active { background: #eef2ff; color: #4f46e5 !important; }

/* ---------- Hero ---------- */
.hero {
  margin-top: -68px; /* ดึง Hero ขึ้นไปอยู่ใต้ navbar โปร่งใส (ชดเชย padding ของ v-main) */
  position: relative;
  color: #fff;
  text-align: center;
  padding: 160px 0 100px;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 20%, rgba(236, 72, 153, 0.5), transparent 40%),
    radial-gradient(circle at 85% 15%, rgba(6, 182, 212, 0.4), transparent 40%),
    linear-gradient(135deg, #1e1b6e 0%, #4f46e5 55%, #7c3aed 100%);
}
.avatar {
  background: linear-gradient(135deg, #f472b6, #22d3ee);
  border: 4px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}
.hello { opacity: 0.85; font-size: 1.1rem; }
.hero-name { font-size: 3rem; font-weight: 700; line-height: 1.2; margin: 6px 0; }
.hero-role { font-size: 1.3rem; color: #f9a8d4; font-weight: 500; }
.hero-desc { max-width: 620px; margin: 16px auto 0; opacity: 0.85; }
/* สถิติ : จัดกึ่งกลางด้วย flex (ไม่ใช้ v-row เพราะมี margin ติดลบของ Vuetify ทำให้เบี้ยว) */
.stats {
  display: flex;
  justify-content: center;
  gap: 56px;
  margin-top: 56px;
}
.stat { min-width: 90px; }
.stat-num { font-size: 2.2rem; font-weight: 600; line-height: 1.1; }
.stat-label { font-size: 0.85rem; opacity: 0.75; margin-top: 4px; }

/* ---------- Section ---------- */
.section { padding: 88px 0; scroll-margin-top: 68px; }
.section.alt { background: #f5f3ff; }
.section .container { max-width: 1100px; }

/* ---------- Card ---------- */
.card {
  border-radius: 16px !important;
  border: 1px solid #e5e7eb !important;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px -16px rgba(79, 70, 229, 0.35) !important;
}
.card-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; }
.icon-box { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
.info-row { display: flex; padding: 10px 0; border-bottom: 1px dashed #e5e7eb; }
.info-row:last-child { border-bottom: 0; }
.info-label { width: 120px; flex-shrink: 0; color: #6b7280; }
.info-value { font-weight: 500; }
.col-heading { font-size: 1.15rem; font-weight: 600; margin-bottom: 16px; }
.job-role { font-weight: 600; font-size: 1.05rem; }
.period { color: #6366f1; font-size: 0.85rem; font-weight: 500; }
.timeline { padding-top: 0; }

/* ---------- มือถือ ---------- */
@media (max-width: 600px) {
  .hero { padding-top: 110px; }
  .hero-name { font-size: 2.1rem; }
  .section { padding: 64px 0; }
  .stats { gap: 24px; }
}
}
</style>

<style scoped>
/* รายการเมนูบนมือถือที่ตรงกับหัวข้อที่กำลังดูอยู่ (v-menu ถูกย้ายออกนอก .w1 จึงใช้ scoped) */
.active-item { background: #eef2ff; }
.active-item .v-list-item__title { color: #4f46e5; font-weight: 600; }
</style>
