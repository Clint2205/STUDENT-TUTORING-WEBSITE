//LoginPage.vue - Combined marketing and auth page with image modal and tutor showcase

<template>
  <div class="auth-shell">
    <!-- Left: Marketing / About -->
    <section class="brand">
      <div class="brand-inner">
        <div class="logo">
          <span class="logo-mark">🎓</span>
          <span class="logo-text">TutorBridge</span>
        </div>

        <h1 class="headline">Support that helps every learner thrive</h1>

        <p class="subhead">
          A tutoring platform connecting parents, students, and tutors — with secure accounts
          and admin approval to keep everyone safe.
        </p>

        <div class="cta-row">
          <a class="about-link" href="#about">About</a>
          <span class="dot">•</span>
          <a class="about-link" href="#contact">Contact</a>
        </div>

        <!-- Existing Image placeholders (click to open modal) -->
        <div class="image-grid">
          <div class="image-card">
            <div class="image-title">Director</div>

            <button
              class="imgBtn"
              type="button"
              @click="openModal({ src: directorimage, title: 'Director', caption: 'Sir Clint' })"
              aria-label="Open Director image"
            >
              <img class="img" :src="directorimage" alt="Image of Director" />
              <div class="zoomBadge">🔍 View</div>
            </button>

            <div class="image-caption">Sir Clint</div>
          </div>

          <div class="image-card">
            <div class="image-title">Tutoring</div>

            <button
              class="imgBtn"
              type="button"
              @click="openModal({ src: tutoringImage, title: 'Tutoring', caption: 'Tutor Bridge.' })"
              aria-label="Open Tutoring image"
            >
              <img class="img" :src="tutoringImage" alt="Children being tutored" />
              <div class="zoomBadge">🔍 View</div>
            </button>

            <div class="image-caption">Tutor Bridge.</div>
          </div>
        </div>

        <!-- ✅ Tutors showcase (5 cards) -->
        <div class="tutor-section">
          <h3 class="section-title">Meet our tutors</h3>
          <p class="section-subtitle">
            Friendly, vetted tutors focused on confidence, progress, and clear goals.
          </p>

          <div class="tutor-grid">
            <div class="tutor-card" v-for="t in tutors" :key="t.id">
              <!-- clickable photo -->
              <button
                class="tutor-photoBtn"
                type="button"
                @click="openModal({ src: t.photo, title: t.name, caption: t.tag })"
                :aria-label="`Open photo of ${t.name}`"
              >
                <div class="tutor-photo" :style="{ backgroundImage: `url(${t.photo})` }"></div>
                <div class="zoomBadge small">🔍 View</div>
              </button>

              <div class="tutor-meta">
                <div class="tutor-name">{{ t.name }}</div>
                <div class="tutor-tag">{{ t.tag }}</div>

                <p class="tutor-bio">{{ t.bio }}</p>

                <div class="tutor-badges">
                  <span class="badge" v-for="b in t.badges" :key="b">{{ b }}</span>
                </div>
              </div>
            </div>
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
          <p class="muted">Placeholder: email/phone/social links here later.</p>
        </div>
      </div>
    </section>

    <!-- Right: Auth card -->
    <section class="auth">
      <div class="auth-card">
        <!-- STATUS MESSAGE -->
        <div v-if="message.text" :class="['message', message.type]">
          {{ message.text }}
        </div>

        <h2 class="auth-title">{{ isRegister ? "Create your account" : "Welcome back" }}</h2>
        <p class="auth-subtitle">
          {{ isRegister ? "Register to request access." : "Log in to continue." }}
        </p>

        <form @submit.prevent="handleSubmit" autocomplete="on" class="form">
          <div class="field">
            <label>Email or Student Login ID</label>
            <input
              type="text"
              v-model="form.identifier"
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
            <select v-model="form.role" required :disabled="loading" autocomplete="off">
              <option disabled value="">Select Role</option>
              <option value="parent">Parent</option>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
              <option value="admin" v-if="!adminCheckLoading && !adminExists">Admin</option>

            </select>
          </div>

     <div
  class="field"
  v-if="isRegister && (form.role === 'student' || form.role === 'tutor' || form.role === 'parent')"
>
  <label>Subjects</label>

  <p class="muted small" v-if="subjectOptions.length === 0">
    Loading subjects...
  </p>

  <select
    v-else
    v-model="form.subjects"
    multiple
    required
    :disabled="loading"
    class="subjectMulti"
  >
    <option v-for="s in subjectOptions" :key="s" :value="s">
      {{ s }}
    </option>
  </select>

  <p class="muted small">Hold Ctrl (Windows) / Cmd (Mac) to select multiple.</p>
</div>
<div class="field" v-if="isRegister && form.role === 'student'">
  <label>Choose Tutor(s)</label>

  <p v-if="loadingTutors" class="muted small">Finding tutors...</p>
  <p v-else-if="matchingTutors.length === 0" class="muted small">
    No tutors found for those subjects yet. You can still register — admin can assign later.
  </p>

  <select
    v-else
    v-model="form.tutorIds"
    multiple
    class="subjectMulti"
    :disabled="loading"
  >
    <option v-for="t in matchingTutors" :key="t._id" :value="t._id">
      {{ t.name }} — {{ (t.subjects || []).join(", ") }}
    </option>
  </select>

  <p class="muted small">Hold Ctrl/Cmd to select multiple.</p>
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

    <!-- ✅ Image modal (for ALL images) -->
    <transition name="fade">
      <div
        v-if="modal.open"
        class="modalOverlay"
        role="dialog"
        aria-modal="true"
        :aria-label="modal.title || 'Image preview'"
        @click.self="closeModal"
      >
        <div class="modalCard" ref="modalCard">
          <div class="modalHeader">
            <div class="modalTitleWrap">
              <div class="modalTitle">{{ modal.title }}</div>
              <div class="modalCaption">{{ modal.caption }}</div>
            </div>

            <button class="modalClose" type="button" @click="closeModal" aria-label="Close">
              ✕
            </button>
          </div>

          <img class="modalImg" :src="modal.src" :alt="modal.title || 'Preview'" />

          <div class="modalFooter">
            <button class="modalAction" type="button" @click="closeModal">
              Close
            </button>
            <span class="hint">Tip: press <kbd>Esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { login, register } from "../services/authService";
import axios from "axios";

import tutoringImage from "../assets/student being tutored.webp";
import directorimage from "../assets/Graduation pic.jpeg";

import tutor1 from "../assets/Faith2.jpeg";
import tutor2 from "../assets/Mr. Ojwang.jpeg";
import tutor3 from "../assets/Ms Faith.jpeg";
import tutor4 from "../assets/teacher 1.jpeg";
import tutor5 from "../assets/Victotr Odede.jpeg";

export default {
  name: "LoginPage",

  data() {
    return {
      isRegister: false,
      adminExists: false,
      loading: false,
      message: { text: "", type: "" }, // success | error
      
      subjectOptions: [],
     form: { name: "", email: "", identifier: "", password: "", role: "", subjects: [], tutorIds: [] },

      tutoringImage,
      directorimage,
      matchingTutors: [],
      loadingTutors: false,


      tutors: [
        {
          id: 1,
          name: "Faith",
          tag: "Maths • General science & General science",
          bio: "Patient, structured lessons to build confidence fast. Great for exam prep and bridging gaps.",
          badges: ["GCSE Focus", "Confidence"],
          photo: tutor1
        },
        {
          id: 2,
          name: "Mr. Ojwang Steve Jacob",
          tag: "Physics • Biology • Math & Chemistry",
          bio: "Turns complex topics into simple steps using examples and quick quizzes to reinforce learning.",
          badges: ["Exam Technique", "Clarity"],
          photo: tutor2
        },
        {
          id: 3,
          name: "Ms Faith",
          tag: "English & Literature",
          bio: "Supportive feedback to improve comprehension and writing structure—session by session.",
          badges: ["Essay Skills", "Literacy"],
          photo: tutor3
        },
        {
          id: 4,
          name: "Teacher 1",
          tag: "Biology & Chemistry",
          bio: "Focused revision, practice questions, and simple explanations to help students improve quickly.",
          badges: ["Targeted Practice", "Supportive"],
          photo: tutor4
        },
        {
          id: 5,
          name: "Victotr Odede",
          tag: "Maths • Science • Chemistry & Global perspective for KS3",
          bio: "Warm, engaging lessons for young learners with clear progress updates for parents.",
          badges: ["KS3", "Encouraging"],
          photo: tutor5
        }
      ],

      modal: {
        open: false,
        src: "",
        title: "",
        caption: ""
      },
      adminCheckLoading: true,


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
  const res = await axios.get("/api/admin/check");
  this.adminExists = !!res.data.adminExists;
} finally {
  this.adminCheckLoading = false;
}

    try {
  const subj = await axios.get("/api/auth/subjects");
  this.subjectOptions = subj.data.subjects || [];
} catch (err) {
  console.error("Subject list fetch failed", err);
}

  },

  mounted() {
    window.addEventListener("keydown", this.onKeyDown);
  },

  watch: {
  "form.subjects": {
    deep: true,
    async handler() {
      if (!this.isRegister) return;
      if (this.form.role !== "student") return; // only students choose tutors now
      if (!this.form.subjects || this.form.subjects.length === 0) {
        this.matchingTutors = [];
        this.form.tutorIds = [];
        return;
      }

      this.loadingTutors = true;
      try {
        const qs = this.form.subjects.join(",");
        const res = await axios.get(`/api/auth/tutors/match?subjects=${encodeURIComponent(qs)}`);
        this.matchingTutors = res.data.tutors || [];
      } catch (e) {
        console.error(e);
        this.matchingTutors = [];
      } finally {
        this.loadingTutors = false;
      }
    }
  },

  "form.role"(newRole) {
    // reset tutor choice when role changes
    if (newRole !== "student") {
      this.matchingTutors = [];
      this.form.tutorIds = [];
    }
  }
},


  beforeUnmount() {
    window.removeEventListener("keydown", this.onKeyDown);
  },

  methods: {
    openModal({ src, title = "", caption = "" }) {
      this.modal = { open: true, src, title, caption };
      document.body.style.overflow = "hidden";
    },

    closeModal() {
      this.modal.open = false;
      document.body.style.overflow = "";
      // reset after transition for cleanliness
      setTimeout(() => {
        this.modal.src = "";
        this.modal.title = "";
        this.modal.caption = "";
      }, 160);
    },

    onKeyDown(e) {
      if (e.key === "Escape" && this.modal.open) this.closeModal();
    },

    async handleSubmit() {
      if (this.loading) return;
      this.loading = true;

      try {
        if (this.isRegister) {
          await register(this.form);

          this.showMessage(
            "Registration successful! Please wait for admin approval via email.",
            "success"
          );

          this.isRegister = false;
          this.form = { name: "", email: "", password: "", role: "", subjects: [] };

        } else {
         const response = await login({
  identifier: this.form.identifier,
  password: this.form.password
});

// 🔐 FIRST LOGIN DETECTED
if (response.data.forcePasswordChange) {
  this.$router.push({
    path: "/change-password",
    query: { userId: response.data.userId }
  });
  return;
}

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
          localStorage.setItem("lastActiveAt", String(Date.now()));

          this.showMessage("Login successful ✅", "success");

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

.subjectMulti {
  min-height: 120px;
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

/* Existing Images */
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

.imgBtn {
  width: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  position: relative;
  border-radius: 12px;
  outline: none;
}
.imgBtn:focus-visible {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.16);
}

.img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  transition: transform 0.18s ease, filter 0.18s ease;
}

.imgBtn:hover .img {
  transform: scale(1.01);
  filter: saturate(1.05) contrast(1.02);
}

.image-caption {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(71, 85, 105, 0.9);
}

.zoomBadge {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  font-weight: 900;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
}
.zoomBadge.small {
  right: 8px;
  bottom: 8px;
  padding: 5px 9px;
  font-size: 11px;
}

/* ✅ Tutors section */
.tutor-section {
  margin-top: 14px;
}

.section-title {
  margin: 0 0 6px;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.section-subtitle {
  margin: 0 0 12px;
  color: rgba(71, 85, 105, 0.95);
  max-width: 70ch;
}

.tutor-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.tutor-card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 23, 42, 0.10);
  border-radius: 14px;
  padding: 10px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.tutor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.tutor-photoBtn {
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  position: relative;
  border-radius: 12px;
  outline: none;
}
.tutor-photoBtn:focus-visible {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.16);
}

.tutor-photo {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: transform 0.18s ease, filter 0.18s ease;
}

.tutor-photoBtn:hover .tutor-photo {
  transform: scale(1.01);
  filter: saturate(1.05) contrast(1.02);
}

.tutor-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tutor-name {
  font-weight: 900;
  letter-spacing: -0.01em;
}

.tutor-tag {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.95);
  font-weight: 800;
}

.tutor-bio {
  margin: 0;
  font-size: 13px;
  color: rgba(30, 41, 59, 0.92);
  line-height: 1.35;
}

.tutor-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}

.badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(79, 70, 229, 0.18);
  background: rgba(79, 70, 229, 0.10);
  color: rgba(79, 70, 229, 0.95);
  font-weight: 800;
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
  to {
    transform: rotate(360deg);
  }
}

/* ✅ Modal */
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.62);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 9999;
}

.modalCard {
  width: min(980px, 96vw);
  max-height: 90vh;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 50px rgba(2, 6, 23, 0.35);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.modalHeader {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 12px 10px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.modalTitleWrap {
  display: grid;
  gap: 2px;
}
.modalTitle {
  font-weight: 950;
  letter-spacing: -0.02em;
  font-size: 16px;
}
.modalCaption {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.95);
  font-weight: 700;
}

.modalClose {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  font-size: 16px;
}
.modalClose:hover {
  background: rgba(239, 68, 68, 0.10);
  border-color: rgba(239, 68, 68, 0.22);
}

.modalImg {
  width: 100%;
  height: 100%;
  max-height: calc(90vh - 110px);
  object-fit: contain;
  background: rgba(2, 6, 23, 0.03);
}

.modalFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.modalAction {
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: 900;
  cursor: pointer;
}
.modalAction:hover {
  border-color: rgba(79, 70, 229, 0.28);
  background: rgba(79, 70, 229, 0.08);
}

.hint {
  color: rgba(71, 85, 105, 0.95);
  font-size: 12px;
}
kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(255, 255, 255, 0.8);
}

/* Fade transition for modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.16s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
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

@media (min-width: 860px) {
  .tutor-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
