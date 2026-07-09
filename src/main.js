import { createApp } from 'vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.css'
import App from './App.vue'

import { 
  AlarmClock, Connection, DataAnalysis, Document, DocumentCopy,
  Download, Edit, Grid, InfoFilled, Lightning, Odometer,
  QuestionFilled, RefreshRight, Setting, WarningFilled, WindPower
} from '@element-plus/icons-vue'

const app = createApp(App)

app.component('ElIconAlarmClock', AlarmClock)
app.component('ElIconConnection', Connection)
app.component('ElIconDataAnalysis', DataAnalysis)
app.component('ElIconDocument', Document)
app.component('ElIconDocumentCopy', DocumentCopy)
app.component('ElIconDownload', Download)
app.component('ElIconEdit', Edit)
app.component('ElIconGrid', Grid)
app.component('ElIconInfoFilled', InfoFilled)
app.component('ElIconLightning', Lightning)
app.component('ElIconOdometer', Odometer)
app.component('ElIconQuestionFilled', QuestionFilled)
app.component('ElIconRefreshRight', RefreshRight)
app.component('ElIconSetting', Setting)
app.component('ElIconWarningFilled', WarningFilled)
app.component('ElIconWindPower', WindPower)

document.documentElement.classList.add('dark')
app.mount('#app')
