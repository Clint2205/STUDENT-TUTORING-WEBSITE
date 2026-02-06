<template>
  <div class="auth-shell">
    <!-- Left: Marketing / About -->
    <section class="brand">
      <div class="brand-inner">
        <div class="logo">
          <span class="logo-mark">🎓</span>
          <span class="logo-text">TutorBridge</span>
        </div>

        <h1 class="headline">
          Support that helps every learner thrive
        </h1>

        <p class="subhead">
          A tutoring platform connecting parents, students, and tutors — with secure accounts
          and admin approval to keep everyone safe.
        </p>

        <div class="cta-row">
          <a class="about-link" href="#about">About</a>
          <span class="dot">•</span>
          <a class="about-link" href="#contact">Contact</a>
        </div>

        <!-- Image placeholders (swap src later) -->
        <div class="image-grid">
          <div class="image-card">
            <div class="image-title">Director</div>
            <!-- placeholder image -->
            <img
              class="img"
              :src="directorimage"
              alt="Image of Director "
            />
            <div class="image-caption">Sir Clint</div>
          </div>

          <div class="image-card">
            <div class="image-title">Tutoring</div>
            <img
              class="img"
              :src="tutoringImage"
              alt="Children being tutored"
            />
            <div class="image-caption">Tutor Bridge.</div>
          </div>
        </div>

        <!-- About section -->
        <div id="about" class="info-card">
          <h3>About TutorBridge</h3>
          <p>
            TutorBridge helps families find trusted tutors, supports students with learning goals,
            and gives tutors a simple way to manage learners. Admin approval ensures the platform
            stays safe and professional.
          </p>
        </div>

        <div id="contact" class="info-card">
          <h3>Contact</h3>
          <p class="muted">
            Placeholder:  email/phone/social links here later.
          </p>
        </div>
      </div>
    </section>

    <!-- Right: Auth card -->
    <section class="auth">
      <div class="auth-card">
        <!--  STATUS MESSAGE -->
        <div v-if="message.text" :class="['message', message.type]">
          {{ message.text }}
        </div>

        <h2 class="auth-title">{{ isRegister ? "Create your account" : "Welcome back" }}</h2>
        <p class="auth-subtitle">
          {{ isRegister ? "Register to request access." : "Log in to continue." }}
        </p>

        <form @submit.prevent="handleSubmit" autocomplete="on" class="form">
          <div class="field">
            <label>Email</label>
            <input
              type="email"
              v-model="form.email"
              placeholder="you@example.com"
              required
              :disabled="loading"
              autocomplete="email"
              inputmode="email"
            />
          </div>

          <div class="field">
            <label>Password</label>
            <input
              type="password"
              v-model="form.password"
              placeholder="••••••••"
              required
              :disabled="loading"
              :autocomplete="isRegister ? 'new-password' : 'current-password'"
            />
          </div>

          <div class="field" v-if="isRegister">
            <label>Full name</label>
            <input
              type="text"
              v-model="form.name"
              placeholder="Full Name"
              required
              :disabled="loading"
              autocomplete="name"
            />
          </div>

          <div class="field" v-if="isRegister">
            <label>Role</label>
            <select
              v-model="form.role"
              required
              :disabled="loading"
              autocomplete="off"
            >
              <option disabled value="">Select Role</option>
              <option value="parent">Parent</option>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="admin" v-if="!adminExists">Admin</option>
            </select>
          </div>

          <button class="primary" type="submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-if="loading">Processing...</span>
            <span v-else>{{ isRegister ? "Register" : "Login" }}</span>
          </button>
        </form>

        <button
          class="link-btn"
          type="button"
          :disabled="loading"
          @click="!loading && (isRegister = !isRegister)"
        >
          {{ isRegister ? "Already have an account? Login" : "No account? Register" }}
        </button>

        <p class="fineprint">
          By continuing, you agree to keep the platform respectful and safe for learners.
        </p>
      </div>
    </section>
  </div>
</template>


<script>
import { login, register } from "../services/authService";
import axios from "axios";
import tutoringImage from "../assets/student being tutored.webp";
import directorimage from "../assets/Graduation pic.jpeg";

export default {
  name: "LoginPage",

  data() {
    return {
      isRegister: false,
      adminExists: false,
      loading: false,
      message: { text: "", type: "" }, // success | error
      form: { name: "", email: "", password: "", role: "" },
      tutoringImage,
      directorimage
    };
  },

  async created() {
    // ✅ Show logout reason (set by router guard)
    const reason = localStorage.getItem("logoutReason");
    if (reason) {
      localStorage.removeItem("logoutReason");
      this.showMessage(
        reason === "idle"
          ? "You were logged out due to inactivity. Please log in again."
          : "You have been logged out. Please log in again.",
        "error"
      );
    }

    // Check if admin exists (for admin option)
    try {
      const res = await axios.get("http://localhost:5000/api/admin/check");
      this.adminExists = res.data.adminExists;
    } catch (err) {
      console.error("Admin check failed", err);
    }
  },

  methods: {
    async handleSubmit() {
      if (this.loading) return;
      this.loading = true;

      try {
        if (this.isRegister) {
          // ✅ Register user but DO NOT auto-login
          await register(this.form);

          this.showMessage(
            "Registration successful! Please wait for admin approval via email.",
            "success"
          );

          // Back to login form + reset inputs
          this.isRegister = false;
          this.form = { name: "", email: "", password: "", role: "" };

        } else {
          //  Login flow
          const response = await login({
            email: this.form.email,
            password: this.form.password
          });

          if (!response?.data?.token || !response?.data?.role) {
            throw new Error("Invalid auth response");
          }

          // Store token + user
          localStorage.setItem("token", response.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              _id: response.data._id,
              name: response.data.name,
              email: response.data.email,
              role: response.data.role
            })
          );

          // Set last activity timestamp for 1-min timeout rule
          localStorage.setItem("lastActiveAt", String(Date.now()));

          this.showMessage("Login successful ✅", "success");

          // Smooth redirect after banner
          setTimeout(() => {
            this.redirectByRole(response.data.role);
          }, 1200);
        }
      } catch (err) {
        console.error("AUTH ERROR:", err);
        this.showMessage(
          err.response?.data?.message || err.message || "Authentication failed",
          "error"
        );
      } finally {
        this.loading = false;
      }
    },

    redirectByRole(role) {
      const routes = {
        admin: "/admin",
        tutor: "/tutor",
        parent: "/parent",
        student: "/student"
      };
      this.$router.push(routes[role] || "/");
    },

    showMessage(text, type = "success") {
      this.message.text = text;
      this.message.type = type;

      setTimeout(() => {
        this.message.text = "";
        this.message.type = "";
      }, 5000);
    }
  }
};
</script>

<style scoped>
/* Full screen shell */
.auth-shell {
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 0;
  background:
    radial-gradient(1200px 600px at 10% 10%, rgba(236, 254, 255, 0.95), transparent 60%),
    radial-gradient(1000px 600px at 90% 0%, rgba(238, 242, 255, 0.95), transparent 55%),
    linear-gradient(180deg, #ffffff, #f8fafc);
}

/* Left marketing section */
.brand {
  padding: 28px;
  display: flex;
  align-items: stretch;
}

.brand-inner {
  width: 100%;
  max-width: 760px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.logo-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(79, 70, 229, 0.12);
  border: 1px solid rgba(79, 70, 229, 0.18);
}
.logo-text {
  font-weight: 900;
  letter-spacing: -0.02em;
}

.headline {
  font-size: 34px;
  line-height: 1.1;
  margin: 0 0 10px;
  letter-spacing: -0.03em;
}

.subhead {
  margin: 0 0 14px;
  color: rgba(71, 85, 105, 0.95);
  max-width: 64ch;
}

.cta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.about-link {
  color: #4f46e5;
  font-weight: 800;
  text-decoration: none;
}
.about-link:hover {
  text-decoration: underline;
}
.dot {
  color: rgba(71, 85, 105, 0.7);
}

/* Images */
.image-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 18px 0;
}

.image-card {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 23, 42, 0.10);
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.image-title {
  font-weight: 900;
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.image-caption {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(71, 85, 105, 0.9);
}

/* About cards */
.info-card {
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 23, 42, 0.10);
  border-radius: 14px;
  padding: 12px;
}

.info-card h3 {
  margin: 0 0 6px;
}
.muted {
  color: rgba(71, 85, 105, 0.95);
}

/* Right auth section */
.auth {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.10);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.auth-title {
  margin: 0 0 4px;
  font-size: 22px;
  letter-spacing: -0.02em;
}

.auth-subtitle {
  margin: 0 0 14px;
  color: rgba(71, 85, 105, 0.95);
}

/* Form */
.form {
  display: grid;
  gap: 10px;
}

.field label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 6px;
  color: rgba(30, 41, 59, 0.95);
}

input,
select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.75);
  outline: none;
}

input:focus,
select:focus {
  border-color: rgba(79, 70, 229, 0.45);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.10);
}

/* Primary button */
.primary {
  width: 100%;
  border: 1px solid rgba(79, 70, 229, 0.35);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.14), rgba(6, 182, 212, 0.12));
  color: #0f172a;
  font-weight: 900;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.link-btn {
  margin-top: 10px;
  width: 100%;
  background: transparent;
  border: none;
  color: #4f46e5;
  font-weight: 800;
  cursor: pointer;
  padding: 10px 0;
}

.fineprint {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(71, 85, 105, 0.9);
}

/* Status banner */
.message {
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 12px;
  font-weight: 700;
  border: 1px solid rgba(15, 23, 42, 0.10);
  background: rgba(255, 255, 255, 0.75);
}

.message.success {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.10);
  color: #166534;
}

.message.error {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.10);
  color: #991b1b;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 3px solid rgba(15, 23, 42, 0.18);
  border-top: 3px solid rgba(79, 70, 229, 0.8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive: stack on small screens */
@media (max-width: 980px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }
  .brand {
    padding-bottom: 10px;
  }
  .auth {
    padding-top: 10px;
  }
  .image-grid {
    grid-template-columns: 1fr;
  }
  .img {
    height: 200px;
  }
}
</style>
