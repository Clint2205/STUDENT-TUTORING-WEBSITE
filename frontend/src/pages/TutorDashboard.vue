<!-- src/pages/TutorDashboard.vue -->

<template>
  <DashboardLayout>
    <template #nav>
      <TutNav :activeTab="activeTab" />
    </template>

    <!-- ✅ Header: greeting, refresh & logout -->
    <div class="headerRow">
      <h1 class="pageTitle">
        <span v-if="me">{{ greeting }}, {{ me.name }} 👋</span>
        <span v-else>Welcome 👋</span>
      </h1>

      <div class="headerActions">
        <button class="refreshBtn" @click="refreshData">🔄 Refresh</button>
        <button class="logoutBtn" @click="logout">Logout</button>
      </div>
    </div>

    <!-- STATUS MESSAGE -->
    <div v-if="message.text" :class="['message', message.type]">
      {{ message.text }}
    </div>

    <!-- DASHBOARD TAB -->
    <section v-if="activeTab === 'dashboard'" class="card">
      <h2>Overview</h2>

      <div class="grid">
        <div class="stat">
          <div class="muted">My students</div>
          <div class="big">{{ students.length }}</div>
        </div>

        <div class="stat">
          <div class="muted">Resources</div>
          <div class="big">{{ resources.length }}</div>
        </div>
      </div>
    </section>

    <!-- STUDENTS TAB -->
    <section v-if="activeTab === 'students'" class="card">
      <h2>My Students</h2>

      <input
        v-model="studentSearch"
        class="input"
        placeholder="Search students..."
      />

      <p v-if="loadingStudents">Loading...</p>
      <p v-else-if="filteredStudents.length === 0" class="muted">
        No students assigned yet.
      </p>

      <ul v-else class="list">
        <li v-for="s in filteredStudents" :key="s._id" class="row">
          <div>
            <strong>{{ s.name || 'Student' }}</strong>
            <div class="muted">{{ s.email }}</div>
          </div>
          <button class="btn" @click="selectStudent(s)">Select</button>
        </li>
      </ul>

      <div v-if="selectedStudent" class="selected">
        Selected:
        <strong>{{ selectedStudent.name || selectedStudent.email }}</strong>
        <button class="linkBtn" @click="selectedStudent = null">Clear</button>
      </div>
    </section>

    <!-- RESOURCES TAB -->
    <section v-if="activeTab === 'resources'" class="card">
      <h2>Resources</h2>

      <div class="formGrid">
        <input
          v-model="resourceForm.title"
          class="input"
          placeholder="Title (required)"
        />

        <select v-model="resourceForm.type" class="input">
          <option value="tutorial">Tutorial</option>
          <option value="youtube">YouTube</option>
          <option value="lesson-plan">Lesson plan</option>
          <option value="assignment">Assignment</option>
          <option value="study">Study</option>
          <option value="meeting">Meeting</option>
          <option value="reminder">Reminder</option>
          <option value="fun">Fun</option>
        </select>

        <select v-model="resourceForm.audienceRole" class="input">
          <option value="student">Students</option>
          <option value="all">All</option>
          <option value="parent">Parents</option>
          <option value="tutor">Tutors</option>
        </select>

        <input
          v-model="resourceForm.url"
          class="input"
          placeholder="Link URL (optional)"
        />

        <input
          type="file"
          class="input"
          ref="fileInput"
          @change="onFileChange"
        />

        <div class="assignBox">
          <div class="muted">Assign to students (optional)</div>

          <select
            v-model="resourceForm.assignedTo"
            multiple
            class="input multi"
          >
            <option v-for="s in students" :key="s._id" :value="s._id">
              {{ s.name || s.email }}
            </option>
          </select>

          <div v-if="selectedStudent" class="muted small">
            Quick add selected student:
            <button class="linkBtn" @click="quickAssignSelected">Add</button>
          </div>
        </div>

        <!-- Context picker -->
        <div class="field">
          <label>Select a student (optional)</label>
          <select v-model="selectedStudentId" class="input">
            <option value="">-- none --</option>
            <option v-for="s in students" :key="s._id" :value="s._id">
              {{ s.name || s.email }}
            </option>
          </select>

          <p class="muted small" v-if="selectedStudentId">
            You can quick-assign this student using the button below.
          </p>

          <button
            class="btn"
            type="button"
            v-if="selectedStudentId"
            @click="quickAssignSelectedId"
          >
            Add selected student to Assigned To
          </button>

          <p class="muted small" v-if="resourceForm.assignedTo.length === 0">
            ⚠️ This will be sent to ALL students
          </p>

          <p class="muted small" v-else>
            ✅ This will be sent to
            {{ resourceForm.assignedTo.length }} student(s)
          </p>
        </div>

        <div class="buttonRow">
          <button
            class="btn"
            @click="createResource"
            :disabled="creatingResource"
          >
            {{ creatingResource ? 'Creating...' : 'Create Link Resource' }}
          </button>

          <button
            class="btn"
            @click="uploadResourceFile"
            :disabled="uploadingFile || !resourceForm.file"
          >
            {{ uploadingFile ? 'Uploading...' : 'Upload File Resource' }}
          </button>
        </div>
      </div>

      <hr style="margin: 18px 0; opacity: 0.35" />

      <h3>Recent Resources</h3>

      <p v-if="loadingResources">Loading...</p>
      <p v-else-if="resources.length === 0" class="muted">No resources yet.</p>

      <ul v-else class="list">
        <li v-for="r in resources" :key="r._id" class="row">
          <div class="grow">
            <strong>{{ r.title }}</strong>

            <div class="muted small">
              Type: {{ r.type }} • Audience: {{ r.audienceRole }}
              <span v-if="r.assignedTo?.length">
                • Assigned: {{ r.assignedTo.length }}
              </span>
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
          </div>

          <button
            class="dangerBtn"
            @click="deleteResource(r)"
            :disabled="deletingId === r._id"
          >
            {{ deletingId === r._id ? 'Deleting...' : 'Delete' }}
          </button>
        </li>
      </ul>
    </section>

    <!-- ASSIGNMENTS TAB -->
    <section v-if="activeTab === 'assignments'" class="card">
      <h2>Assignments</h2>
      <p class="muted">Next step: create assignments per selected student.</p>
    </section>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from "../components/DashboardLayout.vue";
import TutNav from "../components/nav/TutNav.vue";
import api from "../services/api";

export default {
  components: { DashboardLayout, TutNav },

  data() {
    return {
      message: { text: "", type: "success" },
      me: null,
      students: [],
      resources: [],
      loadingStudents: false,
      loadingResources: false,
      studentSearch: "",
      selectedStudent: null,
      resourceForm: {
        title: "",
        type: "tutorial",
        url: "",
        audienceRole: "student",
        assignedTo: [],
        file: null,
      },
      uploadingFile: false,
      creatingResource: false,
      deletingId: null,
      selectedStudentId: "",
    };
  },

  computed: {
    activeTab() {
      const tab = (this.$route.query.tab || "dashboard").toString();
      const allowed = ["dashboard", "students", "resources", "assignments"];
      return allowed.includes(tab) ? tab : "dashboard";
    },
    filteredStudents() {
      const q = this.studentSearch.trim().toLowerCase();
      if (!q) return this.students;
      return this.students.filter(
        (s) =>
          (s.name || "").toLowerCase().includes(q) ||
          (s.email || "").toLowerCase().includes(q)
      );
    },
    greeting() {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 18) return "Good afternoon";
      return "Good evening";
    },
  },

  watch: {
    activeTab: {
      immediate: true,
      handler(tab) {
        if (tab === "students" && this.students.length === 0)
          this.fetchStudents();
        if (tab === "resources" && this.resources.length === 0) {
          if (this.students.length === 0) this.fetchStudents();
          this.fetchResources();
        }
        if (tab === "dashboard") {
          if (this.students.length === 0) this.fetchStudents();
          if (this.resources.length === 0) this.fetchResources();
        }
      },
    },
  },

  mounted() {
    this.fetchMe();
  },

  methods: {
    toast(text, type = "success") {
      this.message = { text, type };
      setTimeout(() => (this.message.text = ""), 4000);
    },

    downloadUrl(fileUrl) {
      if (!fileUrl) return "";
      if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://"))
        return fileUrl;
      return `${window.location.origin}${fileUrl}`;
    },

    quickAssignSelectedId() {
      const id = this.selectedStudentId;
      if (!id) return;
      if (!this.resourceForm.assignedTo.includes(id)) {
        this.resourceForm.assignedTo.push(id);
      }
    },

    logout() {
      localStorage.setItem("logoutReason", "logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("lastActiveAt");
      this.$router.replace({ path: "/" });
    },

    /** 🔄 Refresh button now resets state before refetching data */
    async refreshData() {
      this.toast("Refreshing dashboard...");

      // reset forms and selections
      this.studentSearch = "";
      this.selectedStudent = null;
      this.selectedStudentId = "";
      this.resourceForm = {
        title: "",
        type: "tutorial",
        url: "",
        audienceRole: "student",
        assignedTo: [],
        file: null,
      };
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";

      // clear local lists to force reload
      this.students = [];
      this.resources = [];

      // fetch everything fresh
      await Promise.all([this.fetchMe(), this.fetchStudents(), this.fetchResources()]);

      this.toast("Dashboard refreshed!");
    },

    async fetchMe() {
      try {
        const { data } = await api.get("/auth/me");
        this.me = data;
      } catch (e) {
        console.error("Failed to load user", e);
      }
    },

    async fetchStudents() {
      this.loadingStudents = true;
      try {
        const { data } = await api.get("/tutor/students");
        this.students = data;
      } catch (e) {
        this.toast(e?.response?.data?.message || "Failed to load students", "error");
      } finally {
        this.loadingStudents = false;
      }
    },

    async fetchResources() {
      this.loadingResources = true;
      try {
        const { data } = await api.get("/tutor/resources");
        this.resources = data;
      } catch (e) {
        this.toast(e?.response?.data?.message || "Failed to load resources", "error");
      } finally {
        this.loadingResources = false;
      }
    },

    selectStudent(s) {
      this.selectedStudent = s;
      this.$router.push({ path: "/tutor", query: { tab: "resources" } });
    },

    quickAssignSelected() {
      if (!this.selectedStudent) return;
      const id = this.selectedStudent._id;
      if (!this.resourceForm.assignedTo.includes(id)) {
        this.resourceForm.assignedTo.push(id);
      }
    },

    onFileChange(e) {
      const file = e.target.files?.[0];
      this.resourceForm.file = file || null;
    },

    async createResource() {
      if (!this.resourceForm.title.trim()) {
        this.toast("Title is required", "error");
        return;
      }
      if (!this.resourceForm.type) {
        this.toast("Type is required", "error");
        return;
      }

      this.creatingResource = true;
      try {
        const payload = {
          title: this.resourceForm.title.trim(),
          type: this.resourceForm.type,
          url: this.resourceForm.url.trim() || "",
          audienceRole: this.resourceForm.audienceRole,
          assignedTo: this.resourceForm.assignedTo,
        };
        const { data } = await api.post("/tutor/resources", payload);
        this.resources.unshift(data);

        // reset after creation
        this.resourceForm = {
          title: "",
          type: "tutorial",
          url: "",
          audienceRole: "student",
          assignedTo: [],
          file: null,
        };

        this.toast("Resource created");
      } catch (e) {
        this.toast(e?.response?.data?.message || "Failed to create resource", "error");
      } finally {
        this.creatingResource = false;
      }
    },

    async uploadResourceFile() {
      if (!this.resourceForm.title.trim()) {
        this.toast("Title is required", "error");
        return;
      }
      if (!this.resourceForm.type) {
        this.toast("Type is required", "error");
        return;
      }
      if (!this.resourceForm.file) {
        this.toast("Please choose a file first", "error");
        return;
      }

      this.uploadingFile = true;
      try {
        const fd = new FormData();
        fd.append("title", this.resourceForm.title.trim());
        fd.append("type", this.resourceForm.type);
        fd.append("url", this.resourceForm.url.trim() || "");
        fd.append("audienceRole", this.resourceForm.audienceRole);
        fd.append("assignedTo", this.resourceForm.assignedTo.join(","));
        fd.append("file", this.resourceForm.file);

        const { data } = await api.post("/tutor/resources/upload", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.resources.unshift(data);

        // reset form after upload
        this.resourceForm = {
          title: "",
          type: "tutorial",
          url: "",
          audienceRole: "student",
          assignedTo: [],
          file: null,
        };
        if (this.$refs.fileInput) this.$refs.fileInput.value = "";

        this.toast("File uploaded");
      } catch (e) {
        this.toast(e?.response?.data?.message || "Failed to upload file", "error");
      } finally {
        this.uploadingFile = false;
      }
    },

    async deleteResource(r) {
      this.deletingId = r._id;
      try {
        await api.delete(`/tutor/resources/${r._id}`);
        this.resources = this.resources.filter((x) => x._id !== r._id);
        this.toast("Resource deleted");
      } catch (e) {
        this.toast(e?.response?.data?.message || "Failed to delete resource", "error");
      } finally {
        this.deletingId = null;
      }
    },
  },
};
</script>

<style scoped>
.pageTitle {
  margin: 0 0 10px;
}

.headerRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.headerActions {
  display: flex;
  gap: 10px;
}

.refreshBtn {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  background: #f1f5f9;
  cursor: pointer;
  font-weight: 500;
}
.refreshBtn:hover {
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
}

.logoutBtn {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  background: white;
  cursor: pointer;
  font-weight: 500;
}
.logoutBtn:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #dc3545;
}

.message {
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 14px;
  border: 1px solid rgba(15, 23, 42, 0.1);
}
.message.success {
  background: rgba(34, 197, 94, 0.12);
}
.message.error {
  background: rgba(239, 68, 68, 0.12);
}

.card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 14px;
  padding: 18px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.stat {
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  padding: 12px;
}
.big {
  font-size: 1.6rem;
  font-weight: 800;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  margin: 10px 0;
}

.formGrid {
  display: grid;
  gap: 10px;
}

.assignBox {
  margin-top: 6px;
}

.multi {
  min-height: 110px;
}

.small {
  font-size: 0.9rem;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  gap: 10px;
}
.grow {
  flex: 1;
}

.muted {
  color: #475569;
}

.selected {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(79, 70, 229, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.buttonRow {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
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
}

.linkBtn {
  border: 0;
  background: transparent;
  color: #4f46e5;
  cursor: pointer;
  text-decoration: underline;
}
</style>
