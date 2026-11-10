module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    // ระบุไฟล์ Babel ด้วย path ตรง ๆ เพื่อให้ใช้ได้แม้เปิด VS Code ที่โฟลเดอร์ราก (ไม่ใช่ frontend/)
    babelOptions: { configFile: require('path').resolve(__dirname, 'babel.config.js') }
  },
  rules: {
    'vue/multi-word-component-names': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
