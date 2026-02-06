import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import router from './router/index.js'  
import "./plugins/axios";


const app = createApp(App)

const SESSION_TIMEOUT_MS =  60 * 1000; // 3 minutes

let idleTimerId = null;

function logout(reason = "idle") {
  localStorage.setItem("logoutReason", reason);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("lastActiveAt");

  // Replace history so back button can't return to dashboards
  router.replace("/");
}

function scheduleIdleLogout() {
  // clear old timer
  if (idleTimerId) clearTimeout(idleTimerId);

  const token = localStorage.getItem("token");
  if (!token) return; // not logged in

  idleTimerId = setTimeout(() => {
    logout("idle");
  }, SESSION_TIMEOUT_MS);
}

function touch() {
  const token = localStorage.getItem("token");
  if (!token) return;

  localStorage.setItem("lastActiveAt", String(Date.now()));
  scheduleIdleLogout();
}

// ✅ reset timer on activity
["mousemove", "keydown", "click", "scroll", "touchstart"].forEach((event) => {
  window.addEventListener(event, touch, { passive: true });
});

// ✅ also schedule when app loads (if user already logged in)
scheduleIdleLogout();

app.use(router)  // use router
app.mount('#app')
