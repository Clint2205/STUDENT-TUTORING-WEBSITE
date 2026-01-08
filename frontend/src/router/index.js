import { createRouter, createWebHistory } from 'vue-router'

// Pages
import LoginPage from '../pages/LoginPage.vue'
import ParentDashboard from '../pages/ParentDashboard.vue'
import StudentDashboard from '../pages/StudentDashboard.vue'
import TutorDashboard from '../pages/TutorDashboard.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage
  },

  {
    path: '/parent',
    name: 'ParentDashboard',
    component: ParentDashboard,
    meta: { requiresAuth: true, role: 'parent' }
  },

  {
    path: '/student',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },

  {
    path: '/tutor',
    name: 'TutorDashboard',
    component: TutorDashboard,
    meta: { requiresAuth: true, role: 'tutor' }
  },

  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* 🔐 GLOBAL AUTH + ROLE GUARD */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  let user = null;
  try {
    const storedUser = localStorage.getItem('user');
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  if (to.meta.requiresAuth) {
    if (!token || !user) {
      return next('/');
    }

    if (to.meta.role && user.role !== to.meta.role) {
      return next('/'); // or /unauthorized
    }
  }

  next();
});


export default router
