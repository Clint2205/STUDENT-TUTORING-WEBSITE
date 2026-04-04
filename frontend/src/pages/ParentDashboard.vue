//parent dashboard page, accessible only to users with the "parent" role. It uses the DashboardLayout and ParentNav components to provide a consistent layout and navigation experience for parents.

<template>
  <DashboardLayout>
    <template #nav>
      <ParentNav />
    </template>

    <div class="wrap">
      <header class="header">
        <div class="headerRow">
          <div>
            <h1>Parent Dashboard</h1>
            <p class="muted">
              Add children, match tutors by subject, and view each child’s resources.
            </p>
          </div>

          <!-- ✅ NEW LOGOUT BUTTON -->
          <button class="logoutBtn" @click="logout">Logout</button>
        </div>
      </header>
      

      <!-- STATUS MESSAGE -->
      <div v-if="message.text" :class="['message', message.type]">
        {{ message.text }}
      </div>

      <section class="grid">
        <!-- LEFT: Add Child -->
        <div class="card">
          <div class="row">
            <h2 class="cardTitle">Add Child</h2>
            <button class="ghost" type="button" @click="loadChildren" :disabled="loadingChildren">
              Refresh
            </button>
          </div>

          <form @submit.prevent="handleCreateChild" class="form">
            <div class="field">
              <label>Child name</label>
              <input
                v-model="form.name"
                required
                placeholder="e.g. Jordan"
                :disabled="loading"
              />
            </div>

            <div class="field">
              <label>Age</label>
              <input
                v-model="form.age"
                type="number"
                min="0"
                max="120"
                placeholder="e.g. 10"
                :disabled="loading"
              />
            </div>

            <div class="field">
              <label>Subjects</label>

              <p v-if="subjectOptions.length === 0" class="muted small">Loading subjects...</p>

              <select
                v-else
                v-model="form.subjects"
                multiple
                required
                class="multi"
                :disabled="loading"
              >
                <option v-for="s in subjectOptions" :key="s" :value="s">
                  {{ s }}
                </option>
              </select>

              <p class="muted small">Hold Ctrl (Windows) / Cmd (Mac) to select multiple.</p>
            </div>

            <!-- Tutor matching -->
            <div class="field">
              <label>Assign tutor(s) (optional)</label>

              <p v-if="loadingTutors" class="muted small">Finding tutors...</p>

              <p v-else-if="form.subjects.length > 0 && matchingTutors.length === 0" class="muted small">
                No tutors found for those subjects yet. You can still create the child — admin can assign later.
              </p>

              <select
                v-else-if="matchingTutors.length > 0"
                v-model="form.tutorIds"
                multiple
                class="multi"
                :disabled="loading"
              >
                <option v-for="t in matchingTutors" :key="t._id" :value="t._id">
                  {{ t.name }} — {{ (t.subjects || []).join(", ") }}
                </option>
              </select>

              <p v-if="matchingTutors.length > 0" class="muted small">Tutor selection is optional.</p>
            </div>

            <button class="primary" type="submit" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-if="loading">Creating...</span>
              <span v-else>Create child</span>
            </button>
          </form>

          <!-- Child login shown once -->
          <div v-if="createdLogin.loginId" class="credentials">
            
            <div class="credTitle">Child Login (save this now)</div>
            <div class="credRow"><b>Email:</b> <span class="mono">{{ createdLogin.loginId }}</span></div>
            <div class="credRow"><b>Temp password:</b> <span class="mono">{{ createdLogin.tempPassword }}</span></div>
            <p class="muted small">
              This is shown once. Below you can “reset child password” .
            </p>
          </div>
        </div>

        <!-- RIGHT: Select Child + Resources -->
        <div class="card">
          <h2 class="cardTitle">Your Children</h2>

          <div class="field">
            <label>Select child</label>

            <p v-if="loadingChildren" class="muted small">Loading children...</p>

            <select
              v-else
              v-model="selectedChildId"
              class="select"
              :disabled="children.length === 0"
            >
              <option disabled value="">
                {{ children.length ? "Choose a child" : "No children yet — create one on the left" }}
              </option>

              <option v-for="c in children" :key="c._id" :value="c._id">
                {{ c.childName || c.name }} ({{ (c.subjects || []).join(", ") }})
              </option>
            </select>
          </div>

          <div v-if="selectedChild" class="childMeta">
            <div><b>Name:</b> {{ selectedChild.childName || selectedChild.name }}</div>
            <div><b>Age:</b> {{ selectedChild.age ?? "—" }}</div>
            <div>
              <b>Tutors:</b>
              <span v-if="!selectedChild.tutorIds || selectedChild.tutorIds.length === 0">—</span>
              <span v-else>{{ selectedChild.tutorIds.map(t => t.name || t).join(", ") }}</span>
            </div>
          </div>

                    <button
            class="ghost"
            @click="resetPassword"
            v-if="selectedChildId"
          >
            Reset Child Password
          </button>

          <div class="divider"></div>

          <h3 class="subTitle">Resources</h3>

          <p v-if="!selectedChildId" class="muted">Select a child to view their resources.</p>

          <p v-else-if="loadingResources" class="muted">Loading resources...</p>

          <div v-else>
            <p v-if="resources.length === 0" class="muted">No resources found (or all dismissed).</p>

            <div v-else class="resourceList">
              <article v-for="r in resources" :key="r._id" class="resourceCard">
                <div class="resourceTop">
                  <div class="resourceTitle">{{ r.title }}</div>
                  <div class="pill">{{ r.type }}</div>
                </div>

                <p v-if="r.notes" class="resourceNotes">{{ r.notes }}</p>

                <div v-if="r.url" class="resourceLink">
                  <a :href="r.url" target="_blank" rel="noreferrer">Open link</a>
                </div>

                <div v-if="r.file?.url" class="resourceLink">
                  <a :href="r.file.url" target="_blank" rel="noreferrer">Download file</a>
                </div>

                <div class="actions">
                  <button class="ghost danger" type="button" @click="dismissResource(r._id)">
                    Dismiss for this child
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>

<script>
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout.vue";
import ParentNav from "../components/nav/ParentNav.vue";

export default {
  name: "ParentDashboard",
  components: { DashboardLayout, ParentNav },

  data() {
    return {
      message: { text: "", type: "" },

      subjectOptions: [],

      form: {
        name: "",
        age: "",
        subjects: [],
        tutorIds: []
      },

      matchingTutors: [],
      loadingTutors: false,

      loading: false,
      createdLogin: { loginId: "", tempPassword: "" },

      children: [],
      loadingChildren: false,

      selectedChildId: "",
      selectedChild: null,

      resources: [],
      loadingResources: false
    };
  },

  watch: {
    // ✅ tutor matching on subjects change (same endpoint as student registration)
    "form.subjects": {
      deep: true,
      async handler() {
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

          // keep selected tutors only if still in matching list
          const allowed = new Set(this.matchingTutors.map(t => t._id));
          this.form.tutorIds = (this.form.tutorIds || []).filter(id => allowed.has(id));
        } catch (e) {
          console.error(e);
          this.matchingTutors = [];
        } finally {
          this.loadingTutors = false;
        }
      }
    },

    async selectedChildId(newId) {
      this.selectedChild = this.children.find(c => c._id === newId) || null;
      this.resources = [];
      if (newId) await this.loadResources(newId);
    }
  },

  async created() {
    await this.loadSubjects();
    await this.loadChildren();
  },

  methods: {
    showMessage(text, type = "success") {
      this.message = { text, type };
      setTimeout(() => (this.message = { text: "", type: "" }), 5000);
    },
logout() {
  localStorage.setItem("logoutReason", "logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("lastActiveAt");
  this.$router.replace({ path: "/" });
},
    async loadSubjects() {
      try {
        const res = await axios.get("/api/auth/subjects");
        this.subjectOptions = res.data.subjects || [];
      } catch (e) {
        console.error("Subjects fetch failed:", e);
        this.subjectOptions = [];
      }
    },

    async resetPassword() {
  try {
    const res = await axios.post("/api/auth/parent/reset-child-password", {
      childId: this.selectedChildId
    });

    alert(
      `New Login:\nID: ${res.data.loginId}\nTemp Password: ${res.data.tempPassword}`
    );
  } catch (err) {
    this.showMessage("Failed to reset password", "error");
  }
},

    async loadChildren() {
      this.loadingChildren = true;
      try {
        const res = await axios.get("/api/parent/children");
        this.children = res.data.children || [];

        // keep selection if child still exists
        if (this.selectedChildId && !this.children.some(c => c._id === this.selectedChildId)) {
          this.selectedChildId = "";
          this.selectedChild = null;
          this.resources = [];
        }
      } catch (e) {
        console.error("Children fetch failed:", e);
        this.showMessage("Failed to load children.", "error");
      } finally {
        this.loadingChildren = false;
      }
    },

    async handleCreateChild() {
      if (this.loading) return;
      this.loading = true;
      this.createdLogin = { email: "", tempPassword: "" };

      try {
        const payload = {
          name: this.form.name,
          age: this.form.age,
          subjects: this.form.subjects,
          tutorIds: this.form.tutorIds
        };

        const res = await axios.post("/api/parent/children", payload);

        this.showMessage("Child created ✅", "success");
        this.createdLogin = res.data.studentLogin || { email: "", tempPassword: "" };

        // reset form
        this.form = { name: "", age: "", subjects: [], tutorIds: [] };
        this.matchingTutors = [];

        await this.loadChildren();
      } catch (e) {
        console.error("Create child failed:", e);
        this.showMessage(e.response?.data?.message || "Failed to create child.", "error");
      } finally {
        this.loading = false;
      }
    },

    async loadResources(childUserId) {
      this.loadingResources = true;
      try {
        const res = await axios.get(`/api/parent/children/${childUserId}/resources`);
        this.resources = res.data.resources || [];
      } catch (e) {
        console.error("Load resources failed:", e);
        this.showMessage("Failed to load resources.", "error");
        this.resources = [];
      } finally {
        this.loadingResources = false;
      }
    },

    async dismissResource(resourceId) {
      if (!this.selectedChildId) return;
      try {
        await axios.post(`/api/parent/children/${this.selectedChildId}/hide/${resourceId}`);
        this.resources = this.resources.filter(r => r._id !== resourceId);
      } catch (e) {
        console.error("Dismiss failed:", e);
        this.showMessage("Failed to dismiss resource.", "error");
      }
    }
  }
};
</script>

<style scoped>
.wrap { max-width: 1100px; margin: 0 auto; padding: 18px; }
.header { margin-bottom: 12px; }
.muted { color: rgba(71,85,105,0.95); }
.small { font-size: 12px; }

.grid {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 14px;
  align-items: start;
}

.card {
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(15,23,42,0.10);
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 10px 26px rgba(15,23,42,0.05);
}

.cardTitle { margin: 0 0 10px; font-weight: 950; letter-spacing: -0.02em; }
.subTitle { margin: 0 0 8px; font-weight: 950; }

.form { display: grid; gap: 10px; }
.field label { display:block; font-size: 12px; font-weight: 900; margin-bottom: 6px; }

input, select {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(255,255,255,0.75);
  outline: none;
}

.multi { min-height: 120px; }
.select { min-height: 44px; }

.primary {
  width: 100%;
  border: 1px solid rgba(79,70,229,0.35);
  background: linear-gradient(135deg, rgba(79,70,229,0.14), rgba(6,182,212,0.12));
  font-weight: 950;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  display:flex;
  justify-content:center;
  gap: 10px;
}
.primary:disabled { opacity: 0.65; cursor: not-allowed; }

.row { display:flex; align-items:center; justify-content:space-between; gap: 10px; }

.ghost {
  border: 1px solid rgba(15,23,42,0.12);
  background: rgba(255,255,255,0.85);
  border-radius: 12px;
  padding: 8px 10px;
  font-weight: 900;
  cursor: pointer;
}
.ghost.danger { border-color: rgba(239,68,68,0.25); }
.ghost.danger:hover { background: rgba(239,68,68,0.08); }

.spinner {
  width: 16px; height: 16px;
  border: 3px solid rgba(15,23,42,0.18);
  border-top: 3px solid rgba(79,70,229,0.8);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.message {
  padding: 10px 12px;
  margin: 10px 0 14px;
  border-radius: 12px;
  font-weight: 900;
  border: 1px solid rgba(15,23,42,0.10);
}
.message.success { border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.10); color: #166534; }
.message.error { border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.10); color: #991b1b; }

.credentials {
  margin-top: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px dashed rgba(79,70,229,0.35);
  background: rgba(79,70,229,0.06);
}
.credTitle { font-weight: 950; margin-bottom: 6px; }
.credRow { margin: 4px 0; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.childMeta { display: grid; gap: 6px; padding: 10px 0 0; }

.divider { height: 1px; background: rgba(15,23,42,0.08); margin: 12px 0; }

.resourceList { display: grid; gap: 10px; }

.resourceCard {
  border: 1px solid rgba(15,23,42,0.10);
  background: rgba(255,255,255,0.88);
  border-radius: 14px;
  padding: 12px;
}

.resourceTop { display:flex; justify-content:space-between; gap: 10px; align-items:center; }
.resourceTitle { font-weight: 950; }
.pill {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(79,70,229,0.18);
  background: rgba(79,70,229,0.10);
  font-weight: 900;
}

.resourceNotes { margin-top: 8px; color: rgba(30,41,59,0.92); }
.resourceLink { margin-top: 8px; }
.actions { margin-top: 10px; display:flex; justify-content:flex-end; }

@media (max-width: 980px) {
  .grid { grid-template-columns: 1fr; }
}

.headerRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logoutBtn {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  background: white;
  cursor: pointer;
  font-weight: 600;
}

.logoutBtn:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #dc3545;
}
</style>