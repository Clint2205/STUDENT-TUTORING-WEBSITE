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
      <div class="muted">Students</div>
      <div class="big">{{ dashboard.totalStudents }}</div>
    </div>

    <div class="stat">
      <div class="muted">Hours taught</div>
      <div class="big">{{ dashboard.totalHours }}</div>
    </div>

    <div class="stat">
      <div class="muted">Earnings</div>
      <div class="big">£{{ dashboard.totalEarnings }}</div>
    </div>

    <div class="stat">
      <div class="muted">Sessions</div>
      <div class="big">{{ dashboard.totalSessions }}</div>
    </div>
  </div>
  <h2>My Hourly Rate</h2>

  <input
    type="number"
    v-model="rateForm.hourlyRate"
    class="input"
    placeholder="Hourly rate (£)"
  />

  <button class="btn" @click="updateRate">
    Update Rate
  </button>

  <p class="muted small">
    This rate is used to calculate your earnings automatically.
  </p>

  <div class="stat">
  <div class="muted">Hourly Rate</div>
  <div class="big">£{{ me?.hourlyRate ?? 20 }}</div>
</div>



<!-- Session logging form -->
<section class="card">
  <h2>Session Entry (Log Session)</h2>

  <select v-model="sessionForm.studentId" class="input">
    <option value="">Select student</option>
    <option v-for="s in students" :key="s._id" :value="s._id">
      {{ s.name || s.email }}
    </option>
  </select>

  <select
  v-model="sessionForm.resourceId"
  class="input"
>
  <option disabled value="">
    📚 Select linked resource
  </option>

  <option
    v-for="r in resources"
    :key="r._id"
    :value="r._id"
  >
    {{ r.title }}
  </option>
</select>

  <input
    type="number"
    step="0.25"
    v-model="sessionForm.duration"
    placeholder="Duration (hours)"
    class="input"
  />

  <input
    v-model="sessionForm.notes"
    placeholder="Notes"
    class="input"
  />

  <button class="btn" @click="createSession">
    Log Session
  </button>
</section>

<!-- ✅ SESSIONS LIST -->
<div class="card" style="margin-top: 20px;">
  <h2>Session Review (Feedback)</h2>

  <p v-if="loadingSessions">Loading sessions...</p>

  <div v-else>
    <p v-if="sessions.length === 0" class="muted">
      No sessions logged yet.
    </p>

    <div v-for="s in sessions" :key="s._id" class="sessionCard">

      <div>
        <strong>
          {{ s.studentId?.name || "Student" }}
        </strong>

        <div class="muted small">
  {{ s.duration }}h • £{{ s.totalAmount }}
</div>

<div
  v-if="s.resourceId?.title"
  class="resourceBadge"
>
  📚 Resource:
  <strong>{{ s.resourceId.title }}</strong>
</div>
      </div>

      <!-- 🔥 PASTE YOUR PROGRESS BOX HERE -->
   <!-- ✅ Progress Dropdown -->
<div class="progressWrapper">

  <!-- Header -->
  <div
    class="progressHeader"
    @click="s.showProgress = !s.showProgress"
  >
    <div>
      <strong>Student Progress</strong>

      <div class="small muted">
        {{
          s.progress?.completionStatus === "completed"
            ? "Completed"
            : "Not Completed"
        }}
      </div>
    </div>

    <div class="dropdownIcon">
      {{ s.showProgress ? "▲" : "▼" }}
    </div>
  </div>

  <!-- Dropdown Content -->
  <div
    v-if="s.showProgress"
    class="progressBox"
  >

    <div
      v-if="s.resourceId?.title"
      class="progressResourceTitle"
    >
      {{ s.resourceId.title }}
    </div>

    <!-- Completion -->
    <label class="smallLabel">
      Lesson Completion
    </label>

    <select v-model="s.progress.completionStatus">
      <option value="completed">
        ✅ Completed
      </option>

      <option value="not_completed">
        ❌ Not Completed
      </option>
    </select>

    <!-- Understanding -->
    <label class="smallLabel">
      Understanding Level
    </label>

    <select v-model="s.progress.understandingLevel">

      <option :value="1">
        1 - Very Poor
      </option>

      <option :value="2">
        2 - Needs Improvement
      </option>

      <option :value="3">
        3 - Average
      </option>

      <option :value="4">
        4 - Good
      </option>

      <option :value="5">
        5 - Excellent
      </option>

    </select>

    <!-- Notes -->
    <label class="smallLabel">
      Tutor Notes
    </label>

    <textarea
      v-model="s.progress.tutorNotes"
      placeholder="Explain student progress..."
    ></textarea>

    <!-- Buttons -->
    <div class="progressActions">

      <button
        class="saveProgressBtn"
        @click="submitProgress(s)"
      >
        Save Progress
      </button>

      <button
        class="deleteProgressBtn"
        @click="deleteProgress(s)"
      >
        Delete Progress
      </button>

    </div>

  </div>
</div>

    </div>
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

            <!-- ✅ Student Submissions -->
<div
  v-if="r.submissions && r.submissions.length"
  class="submissionReviewBox"
>

  <h4>Student Submissions</h4>

  <div
    v-for="sub in r.submissions"
    :key="sub._id"
    class="submissionItem"
  >

    <div class="muted small">
      Submitted by:
      {{ sub.studentId?.name || "Student" }}
    </div>

    <div v-if="sub.message">
      <strong>Message:</strong>
      {{ sub.message }}
    </div>

    <div v-if="sub.file?.url">
      <a
        :href="downloadUrl(sub.file.url)"
        target="_blank"
      >
        Download Submission
      </a>
    </div>

    <div class="muted small">
      {{ new Date(sub.submittedAt).toLocaleString() }}
    </div>

  </div>

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

    <!-- BOOKINGS TAB -->
    <section v-if="activeTab === 'bookings'" class="card">
      <h2>Bookings</h2>
     <section class="card">

  <h2>Tutor Availability</h2>

  <div
    v-for="(slot, index)
    in availabilityForm.availability"
    :key="index"
    class="availabilityRow"
  >

    <select v-model="slot.day">

      <option>Monday</option>
      <option>Tuesday</option>
      <option>Wednesday</option>
      <option>Thursday</option>
      <option>Friday</option>
      <option>Saturday</option>
      <option>Sunday</option>

    </select>

    <input
      type="time"
      v-model="slot.startHour"
    />

    <input
      type="time"
      v-model="slot.endHour"
    />

  </div>

  <button
    class="btn"
    @click="addAvailability"
  >
    Add Slot
  </button>

  <button
    class="btn"
    @click="saveAvailability"
  >
    Save Availability
  </button>

</section>

<section class="card">

  <h2>Lesson Bookings</h2>

  <div
    v-for="b in bookings"
    :key="b._id"
    class="bookingCard"
  >

    <strong>
      {{ b.studentId?.name }}
    </strong>

    <div class="muted small">
      {{ new Date(b.startTime)
      .toLocaleString() }}
    </div>

    <div>
      Status:
      {{ b.status }}
    </div>

    <button
      v-if="b.status === 'pending'"
      class="btn"
      @click="approveBooking(b)"
    >
      Approve Booking
    </button>

    <div
      v-if="b.meetingLink"
      class="meetingLink"
    >

      <a
        :href="b.meetingLink"
        target="_blank"
      >
        Join Meeting
      </a>

    </div>

  </div>

</section>
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
      dashboard: {
  totalHours: 0,
  totalEarnings: 0,
  totalSessions: 0,
  totalStudents: 0
},
loadingDashboard: false,
sessionForm: {
  studentId: "",
  resourceId: "",
  duration: "",
  notes: ""
},
rateForm: {
  hourlyRate: ""
},
sessions: [],
loadingSessions: false,
availabilityForm: {
  timezone: "Europe/London",

  availability: [
    {
      day: "Monday",
      startHour: "",
      endHour: ""
    }
  ]
},
bookings: []  
    };
  },

  computed: {
    activeTab() {
      const tab = (this.$route.query.tab || "dashboard").toString();
      const allowed = ["dashboard", "students", "resources", "bookings"];
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

      if (
        tab === "students" &&
        this.students.length === 0
      ) {
        this.fetchStudents();
      }

      if (
        tab === "resources" &&
        this.resources.length === 0
      ) {

        if (this.students.length === 0) {
          this.fetchStudents();
        }

        this.fetchResources();
      }

      if (tab === "dashboard") {

        if (this.students.length === 0) {
          this.fetchStudents();
        }

        if (this.resources.length === 0) {
          this.fetchResources();
        }
      }

      // ✅ LOAD BOOKINGS + AVAILABILITY
      if (tab === "bookings") {
        this.fetchBookings();
      }

    },
  },
},

  mounted() {
    this.fetchMe();
    this.fetchDashboard();
    this.fetchSessions();
    this.fetchBookings();
  },

  methods: {
    toast(text, type = "success") {
      this.message = { text, type };
      setTimeout(() => (this.message.text = ""), 4000);
    },
   async createSession() {
  try {

    await api.post(
      "/tutor/sessions",
      this.sessionForm
    );

    this.toast(
      "Session logged successfully"
    );

    this.sessionForm = {
      studentId: "",
      resourceId: "",
      duration: "",
      notes: ""
    };

    // ✅ refresh dashboard
    await this.fetchDashboard();

    // ✅ refresh sessions list
    await this.fetchSessions();

  } catch (e) {

    this.toast(
      e?.response?.data?.message ||
      "Failed to log session",
      "error"
    );

  }
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

        this.rateForm.hourlyRate = data.hourlyRate || 20;
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

    async fetchDashboard() {
  this.loadingDashboard = true;

  try {
    const { data } = await api.get("/tutor/dashboard");

    this.dashboard = data;
  } catch (e) {
    this.toast(
      e?.response?.data?.message || "Failed to load dashboard",
      "error"
    );
  } finally {
    this.loadingDashboard = false;
  }
},

async updateRate() {
  const rate = Number(this.rateForm.hourlyRate);

  if (!rate || rate < 0) {
    this.toast("Enter a valid rate", "error");
    return;
  }

  try {
    const { data } = await api.put("/tutor/rate", {
      hourlyRate: rate
    });

    this.toast("Rate updated to £" + data.hourlyRate);

    // ✅ THIS IS THE FIX
    this.me.hourlyRate = data.hourlyRate;

  } catch (e) {
    this.toast(
      e?.response?.data?.message || "Failed to update rate",
      "error"
    );
  }
},
async fetchSessions() {

  this.loadingSessions = true;

  try {

    const { data } =
    await api.get("/session/tutor/sessions");

    // ✅ ensure progress always exists
    this.sessions = data.map(session => ({
      ...session,
      showProgress: false,

      progress: session.progress || {
        completionStatus: "completed",
        understandingLevel: 3,
        resourceId: session.resourceId?._id || null,
        tutorNotes: "",
        skills: []
      }
    }));

  } catch (e) {

    this.toast(
      e?.response?.data?.message ||
      "Failed to load sessions",
      "error"
    );

  } finally {

    this.loadingSessions = false;

  }
},
async submitProgress(session) {
  try {

    await api.put(
      `/session/${session._id}/progress`,
      {

        resourceId: session.resourceId,

        completionStatus:
          session.progress.completionStatus,

        understandingLevel:
          session.progress.understandingLevel,

        tutorNotes:
          session.progress.tutorNotes,

        skills:
          session.progress.skills
      }
    );

    this.toast("Progress updated");

    // ✅ refresh sessions immediately
    this.fetchSessions();

  } catch (e) {

    this.toast(
      "Failed to update progress",
      "error"
    );
  }
},

async deleteProgress(session) {

  try {

    await api.delete(
      `/session/${session._id}/progress`
    );

    session.progress = {
      completionStatus: "not_completed",
      understandingLevel: 3,
      tutorNotes: "",
      skills: []
    };

    this.toast("Progress deleted");

    await this.fetchSessions();

  } catch (e) {

    this.toast(
      "Failed to delete progress",
      "error"
    );

  }

},

addAvailability() {

  this.availabilityForm.availability.push({
    day: "Monday",
    startHour: "",
    endHour: ""
  });

},

async saveAvailability() {

  try {

    await api.put(
      "/booking/availability",
      this.availabilityForm
    );

    this.toast(
      "Availability updated"
    );

  } catch (e) {

    this.toast(
      "Failed to save availability",
      "error"
    );

  }

},
async fetchBookings() {

  try {

    const { data } =
      await api.get("/booking/my");

    this.bookings = data;

  } catch (e) {

    console.error(e);

  }

},

async approveBooking(booking) {

  try {

    await api.put(
      `/booking/${booking._id}/approve`
    );

    this.toast(
      "Booking approved"
    );

    this.fetchBookings();

  } catch (e) {

    this.toast(
      "Failed to approve booking",
      "error"
    );

  }

},



  },
};
</script>

<style scoped>
:root {
  --primary: #4f46e5;
  --primary-soft: rgba(79, 70, 229, 0.12);
  --danger: #dc2626;
  --success: #16a34a;
  --bg: #f8fafc;
  --card: rgba(255, 255, 255, 0.92);
  --border: rgba(15, 23, 42, 0.12);
  --text: #0f172a;
  --muted: #64748b;
}

/* GLOBAL */
.pageTitle {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.5px;
}

.headerRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding: 8px 2px;
}

.headerActions {
  display: flex;
  gap: 10px;
}

/* BUTTONS */
.refreshBtn,
.logoutBtn,
.btn,
.dangerBtn,
.saveProgressBtn,
.deleteProgressBtn {
  transition: all 0.2s ease;
  font-weight: 600;
}

/* Refresh */
.refreshBtn {
  padding: 9px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
}
.refreshBtn:hover {
  background: var(--primary-soft);
  color: var(--primary);
  transform: translateY(-1px);
}

/* Logout */
.logoutBtn {
  padding: 9px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
}
.logoutBtn:hover {
  background: rgba(220, 38, 38, 0.08);
  color: var(--danger);
  transform: translateY(-1px);
}

/* Primary */
.btn {
  padding: 10px 14px;
  border-radius: 12px;
  border: none;
  background: var(--primary);
  color: white;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.18);
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.25);
}

/* Danger */
.dangerBtn {
  padding: 10px 14px;
  border-radius: 12px;
  border: none;
  background: var(--danger);
  color: white;
}
.dangerBtn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* LINKS */
.linkBtn {
  border: none;
  background: transparent;
  color: var(--primary);
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
}

/* MESSAGE */
.message {
  padding: 12px 14px;
  border-radius: 14px;
  margin-bottom: 14px;
  border: 1px solid var(--border);
  font-weight: 500;
}
.message.success {
  background: rgba(22, 163, 74, 0.10);
}
.message.error {
  background: rgba(220, 38, 38, 0.10);
}

/* CARD */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  backdrop-filter: blur(8px);
}

/* GRID STATS */
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.stat {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  background: white;
  transition: transform 0.2s ease;
}
.stat:hover {
  transform: translateY(-2px);
}

.big {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--text);
}

/* INPUTS */
.input {
  width: 100%;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  margin: 10px 0;
  font-size: 14px;
  outline: none;
  transition: border 0.2s ease;
  background: white;
}
.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

/* TEXT */
.muted {
  color: var(--muted);
}
.small {
  font-size: 0.9rem;
}

/* LIST */
.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: white;
}

/* SELECTED BOX */
.selected {
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--primary-soft);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* FORMS */
.formGrid {
  display: grid;
  gap: 12px;
}

.assignBox {
  margin-top: 8px;
}

.multi {
  min-height: 120px;
}

/* SESSION CARD */
.sessionCard {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  margin-top: 14px;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* BADGE */
.resourceBadge {
  margin-top: 8px;
  display: inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
}

/* PROGRESS */
.progressWrapper {
  margin-top: 14px;
}

.progressHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border-radius: 14px;
  background: var(--primary-soft);
  cursor: pointer;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}
.progressHeader:hover {
  transform: translateY(-1px);
  background: rgba(79, 70, 229, 0.18);
}

.dropdownIcon {
  font-size: 14px;
  font-weight: 800;
}

/* PROGRESS BOX */
.progressBox {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  background: white;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progressBox select,
.progressBox textarea,
.progressBox input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  font-size: 14px;
  outline: none;
}

.progressBox textarea {
  min-height: 90px;
  resize: vertical;
}

/* LABELS */
.smallLabel {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
}

/* PROGRESS ACTIONS */
.progressActions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.saveProgressBtn {
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: var(--primary);
  color: white;
  font-weight: 700;
  cursor: pointer;
}
.saveProgressBtn:hover {
  transform: translateY(-1px);
}

.deleteProgressBtn {
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: var(--danger);
  color: white;
  font-weight: 700;
  cursor: pointer;
}
.deleteProgressBtn:hover {
  opacity: 0.9;
}

/* TRANSITIONS */
button,
.row,
.stat,
.progressHeader {
  transition: all 0.2s ease;
}

.submissionReviewBox {
  margin-top: 14px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(15,23,42,0.04);
}

.submissionItem {
  padding: 10px;
  border-radius: 10px;
  background: white;
  border: 1px solid rgba(15,23,42,0.08);
  margin-top: 10px;
}
</style>
