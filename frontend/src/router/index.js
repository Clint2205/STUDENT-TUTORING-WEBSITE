

// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";

// Pages
import LoginPage from "../pages/LoginPage.vue";
import ParentDashboard from "../pages/ParentDashboard.vue";
import StudentDashboard from "../pages/StudentDashboard.vue";
import TutorDashboard from "../pages/TutorDashboard.vue";
import AdminDashboard from "../pages/AdminDashboard.vue";

const routes = [
  { path: "/", name: "Login", component: LoginPage },

  { path: "/parent", name: "ParentDashboard", component: ParentDashboard, meta: { requiresAuth: true, role: "parent" } },
  { path: "/student", name: "StudentDashboard", component: StudentDashboard, meta: { requiresAuth: true, role: "student" } },
  { path: "/tutor", name: "TutorDashboard", component: TutorDashboard, meta: { requiresAuth: true, role: "tutor" } },
  { path: "/admin", name: "AdminDashboard", component: AdminDashboard, meta: { requiresAuth: true, role: "admin" } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const SESSION_TIMEOUT_MS = 60 * 1000; // 1 minute (change to 3 * 60 * 1000 for 3 mins)

function safeParseUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearAuth(reason = "logout") {
  localStorage.setItem("logoutReason", reason);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("lastActiveAt");
}

function isAuthedAndFresh() {
  const token = localStorage.getItem("token");
  const user = safeParseUser();
  if (!token || !user) return false;

  const lastActiveAtRaw = localStorage.getItem("lastActiveAt");
  const lastActiveAt = lastActiveAtRaw ? Number(lastActiveAtRaw) : 0;
  if (!lastActiveAt) return false;

  const idleMs = Date.now() - lastActiveAt;
  return idleMs <= SESSION_TIMEOUT_MS;
}

function forceToLogin(reason = "logout") {
  clearAuth(reason);
  // replace history so back won't keep landing on protected page
  router.replace({ path: "/" });
}

/* ✅ GLOBAL AUTH + ROLE + IDLE GUARD */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const user = safeParseUser();

  if (to.meta.requiresAuth) {
    // not logged in
    if (!token || !user) {
      clearAuth("logout");
      return next({ path: "/", replace: true });
    }

    // role mismatch
    if (to.meta.role && user.role !== to.meta.role) {
      clearAuth("logout");
      return next({ path: "/", replace: true });
    }

    // idle timeout check
    const lastActiveAtRaw = localStorage.getItem("lastActiveAt");
    const lastActiveAt = lastActiveAtRaw ? Number(lastActiveAtRaw) : 0;

    if (!lastActiveAt) {
      localStorage.setItem("lastActiveAt", String(Date.now()));
      return next();
    }

    const idleMs = Date.now() - lastActiveAt;
    if (idleMs > SESSION_TIMEOUT_MS) {
      clearAuth("idle");
      return next({ path: "/", replace: true });
    }
  }

  // refresh timestamp for any navigation while logged in
  if (token && user) {
    localStorage.setItem("lastActiveAt", String(Date.now()));
  }

  next();
});

/* ✅ HARD BLOCK: Back/Forward + bfcache restore */
function enforceAuthOnBrowserNav() {
  // If user is NOT allowed, instantly force to login
  if (!isAuthedAndFresh()) {
    forceToLogin("idle");
  } else {
    // still active → refresh timestamp
    localStorage.setItem("lastActiveAt", String(Date.now()));
  }
}

// Back / Forward arrows
window.addEventListener("popstate", () => {
  enforceAuthOnBrowserNav();
});

// If tab becomes visible again (user returns after time)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    enforceAuthOnBrowserNav();
  }
});

// Handles bfcache (browser restores page instantly from memory)
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    enforceAuthOnBrowserNav();
  }
});

export default router;
