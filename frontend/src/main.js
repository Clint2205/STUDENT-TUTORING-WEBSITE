import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from './router/index.js'  
import "./plugins/axios";


const app = createApp(App)
app.use(router)  // use router
app.mount('#app')
