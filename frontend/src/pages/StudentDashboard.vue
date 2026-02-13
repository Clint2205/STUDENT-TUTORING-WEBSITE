<!-- src/pages/StudentDashboard.vue -->

<template>
  <DashboardLayout>
    <template #nav>
      <StudentNav :activeTab="activeTab" />

      <button class="logoutBtn" @click="logout">
        Logout
      </button>
    </template>

    <!-- STATUS MESSAGE -->
    <div v-if="message.text" :class="['message', message.type]">
      {{ message.text }}
    </div>

    <div class="headerRow">
      <h1 class="pageTitle">Student Dashboard</h1>
    </div>

    <!-- DASHBOARD TAB -->
    <section v-if="activeTab === 'dashboard'" class="card">
      <h2>{{ greeting }}{{ me?.name ? `, ${me.name}` : "" }} 👋</h2>

      <p class="muted" v-if="loadingMe">Loading your profile...</p>

      <div v-else class="grid">
        <!-- ✅ FIXED: tutorIds is an ARRAY -->
        <div class="stat">
          <div class="muted">Your tutor(s)</div>

          <div class="big">
            <span v-if="me?.tutorIds?.length">
              {{ tutorNames }}
            </span>
            <span v-else>Not assigned yet</span>
          </div>

          <div class="muted small" v-if="me?.tutorIds?.length">
            {{ tutorEmails }}
          </div>
        </div>

        <div class="stat">
          <div class="muted">Resources available</div>
          <div class="big">{{ resources.length }}</div>
        </div>

        <div class="stat">
          <div class="muted">New resources</div>
          <div class="big">{{ newCount }}</div>
          <div class="muted small">Since your last visit</div>
        </div>
      </div>

      <button class="btn" @click="markSeen" :disabled="markingSeen || resources.length === 0">
        {{ markingSeen ? "Updating..." : "Mark resources as seen" }}
      </button>
    </section>

    <!-- RESOURCES TAB -->
    <section v-if="activeTab === 'resources'" class="card">
      <h2>Resources</h2>

      <p class="muted" v-if="loadingResources">Loading resources...</p>
      <p class="muted" v-else-if="resources.length === 0">No resources yet.</p>

      <ul v-else class="list">
        <li v-for="r in resources" :key="r._id" class="row">
          <div class="grow">
            <strong>{{ r.title }}</strong>

            <div class="muted small">
              Type: {{ r.type }}
              <span v-if="r.createdBy?.name"> • Sent by: {{ r.createdBy.name }}</span>
              <span v-if="isNew(r)" class="badge">NEW</span>
            </div>

            <div v-if="r.url" class="small">
              <a :href="r.url" target="_blank" rel="noreferrer">Open link</a>
            </div>

            <div v-if="r.file?.originalName" class="muted small">
              File: {{ r.file.originalName }}
            </div>

            <div v-if="r.file?.url" class="small">
              <a :href="downloadUrl(r.file.url)" target="_blank" rel="noreferrer">
                Download file
              </a>
            </div>

            <div v-if="r.notes" class="muted small" style="margin-top: 6px;">
              Notes: {{ r.notes }}
            </div>
          </div>

          <!-- ✅ Delete (dismiss) button -->
          <button
            class="dangerBtn"
            type="button"
            @click="dismissResource(r)"
            :disabled="dismissingId === r._id"
          >
            {{ dismissingId === r._id ? "Deleting..." : "Delete" }}
          </button>
        </li>
      </ul>
    </section>

    <!-- ASSIGNMENTS TAB (placeholder) -->
    <section v-if="activeTab === 'assignments'" class="card">
      <h2>Assignments</h2>
      <p class="muted">Next step: show assignments from your tutor here.</p>
    </section>

    <!-- SCHEDULE TAB (placeholder) -->
    <section v-if="activeTab === 'schedule'" class="card">
      <h2>Schedule</h2>
      <p class="muted">Next step: show upcoming sessions and reminders here.</p>
    </section>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from "../components/DashboardLayout.vue"
import StudentNav from "../components/nav/StudentNav.vue"
import api from "../services/api"

export default {
  components: { DashboardLayout, StudentNav },

  data() {
    return {
      message: { text: "", type: "success" },

      me: null,
      resources: [],

      loadingMe: false,
      loadingResources: false,

      markingSeen: false,

      // ✅ for delete button
      dismissingId: null
    }
  },

  computed: {
    activeTab() {
      const tab = (this.$route.query.tab || "dashboard").toString()
      const allowed = ["dashboard", "resources", "assignments", "schedule"]
      return allowed.includes(tab) ? tab : "dashboard"
    },

    greeting() {
      const hour = new Date().getHours()
      if (hour < 12) return "Good morning"
      if (hour < 18) return "Good afternoon"
      return "Good evening"
    },

    // ✅ Tutors as strings
    tutorNames() {
      const tutors = this.me?.tutorIds || []
      if (!tutors.length) return ""
      return tutors.map(t => t?.name || t?.email || "Tutor").join(", ")
    },

    tutorEmails() {
      const tutors = this.me?.tutorIds || []
      if (!tutors.length) return ""
      return tutors.map(t => t?.email).filter(Boolean).join(" • ")
    },

    // number of resources created after lastSeenResourcesAt
    newCount() {
      if (!this.me?.lastSeenResourcesAt) return this.resources.length
      const last = new Date(this.me.lastSeenResourcesAt).getTime()
      return this.resources.filter(r => new Date(r.createdAt).getTime() > last).length
    }
  },

  watch: {
    activeTab: {
      immediate: true,
      handler(tab) {
        if (tab === "dashboard") {
          if (!this.me) this.fetchMe()
          if (this.resources.length === 0) this.fetchResources()
        }
        if (tab === "resources" && this.resources.length === 0) this.fetchResources()
      }
    }
  },

  methods: {
    toast(text, type = "success") {
      this.message = { text, type }
      setTimeout(() => (this.message.text = ""), 4000)
    },

    logout() {
      localStorage.setItem("logoutReason", "logout")
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("lastActiveAt")
      this.$router.replace({ path: "/" })
    },

    downloadUrl(fileUrl) {
      if (!fileUrl) return ""
      if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl
      return `${window.location.origin}${fileUrl}`
    },

    isNew(r) {
      if (!this.me?.lastSeenResourcesAt) return true
      return new Date(r.createdAt).getTime() > new Date(this.me.lastSeenResourcesAt).getTime()
    },

    async fetchMe() {
      this.loadingMe = true
      try {
        const { data } = await api.get("/student/me")
        this.me = data
      } catch (e) {
        this.toast(e?.response?.data?.message || "Failed to load your profile", "error")
      } finally {
        this.loadingMe = false
      }
    },

    async fetchResources() {
      this.loadingResources = true
      try {
        const { data } = await api.get("/student/resources")
        this.resources = data
      } catch (e) {
        this.toast(e?.response?.data?.message || "Failed to load resources", "error")
      } finally {
        this.loadingResources = false
      }
    },

    async markSeen() {
      this.markingSeen = true
      try {
        await api.post("/student/resources/seen")
        await this.fetchMe()
        this.toast("Marked as seen")
      } catch (e) {
        this.toast(e?.response?.data?.message || "Failed to update", "error")
      } finally {
        this.markingSeen = false
      }
    },

    // ✅ Delete (dismiss from student view only)
    async dismissResource(r) {
      this.dismissingId = r._id
      try {
        await api.post(`/student/resources/${r._id}/dismiss`)
        this.resources = this.resources.filter(x => x._id !== r._id)
        this.toast("Resource deleted")
      } catch (e) {
        this.toast(e?.response?.data?.message || "Failed to delete resource", "error")
      } finally {
        this.dismissingId = null
      }
    }
  }
}
</script>

<style scoped>
.message { padding: 12px 14px; border-radius: 12px; margin-bottom: 14px; border: 1px solid rgba(15,23,42,0.10); }
.success { background: rgba(34,197,94,0.12); }
.error { background: rgba(239,68,68,0.12); }

.headerRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.pageTitle { margin: 0 0 10px; }

.logoutBtn {
  margin-left: auto;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(15,23,42,0.15);
  background: white;
  cursor: pointer;
  font-weight: 500;
}

.logoutBtn:hover {
  background: rgba(239,68,68,0.08);
  color: #dc3545;
}

.card {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: 14px;
  padding: 18px;
}

.grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 10px; }
.stat { border: 1px solid rgba(15,23,42,0.10); border-radius: 12px; padding: 12px; }
.big { font-size: 1.4rem; font-weight: 800; }

.list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
.row { display: flex; align-items: flex-start; justify-content: space-between; padding: 12px; border: 1px solid rgba(15,23,42,0.10); border-radius: 12px; gap: 10px; }
.grow { flex: 1; }

.muted { color: #475569; }
.small { font-size: 0.9rem; }

.btn {
  margin-top: 12px;
  padding: 9px 12px;
  border: 0;
  border-radius: 10px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
}

.dangerBtn {
  padding: 9px 12px;
  border: 0;
  border-radius: 10px;
  background: #dc3545;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  height: fit-content;
}

.dangerBtn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  background: rgba(79,70,229,0.15);
  color: #4f46e5;
  font-weight: 700;
}
</style>
