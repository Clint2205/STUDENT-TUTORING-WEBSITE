<template>
  <DashboardLayout>
    <!-- 🔹 NAV BAR -->
    <template #nav>
      <!-- v-model connects nav buttons to activeTab -->
      <AdminNav v-model="activeTab" />
    </template>

    <!-- 🔹 STATUS MESSAGE -->
    <div v-if="message.text" :class="['message', message.type]">
      {{ message.text }}
    </div>

    <h1>Admin Dashboard</h1>

    <div class="page-subtitle">
  Manage approvals, users, content and payments.
</div>


    <!-- ===================== -->
    <!-- 🟦 DASHBOARD TAB -->
    <!-- ===================== -->
    <section v-if="activeTab === 'dashboard'" class="approvals">
      <h2>Pending User Approvals</h2>

      <p v-if="loading">Loading users...</p>

      <p v-if="!loading && users.length === 0">
        No pending approvals 🎉
      </p>

      <table v-if="users.length">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>
              <button @click="approve(user)">Approve</button>
              <button class="danger" @click="reject(user)">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ===================== -->
    <!-- 👥 USERS TAB -->
    <!-- ===================== -->
    <section v-if="activeTab === 'users'" class="users">
  <div class="users-header">
    <h2>Approved Users</h2>

    <div class="users-tools">
      <input v-model="userSearch" class="search" placeholder="Search name/email..." />
      <button @click="fetchApprovedUsers" :disabled="usersLoading">
        {{ usersLoading ? "Loading..." : "Refresh" }}
      </button>
    </div>
  </div>

  <p v-if="usersLoading">Loading approved users...</p>

  <p v-if="!usersLoading && filteredApprovedUsers.length === 0">
    No approved users found.
  </p>

  <table v-if="!usersLoading && filteredApprovedUsers.length" class="users-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Approved At</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="u in filteredApprovedUsers" :key="u._id">
        <td>{{ u.name }}</td>
        <td>{{ u.email }}</td>
        <td>
          <span :class="['badge', `role-${u.role}`]">{{ u.role }}</span>
        </td>
        <td>{{ u.approvedAt ? new Date(u.approvedAt).toLocaleDateString() : "-" }}</td>
      </tr>
    </tbody>
  </table>
</section>


    <!-- ===================== -->
    <!-- 📚 CONTENT TAB -->
    <!-- ===================== -->
    <section v-if="activeTab === 'content'">
      <h2>Content Moderation</h2>

      <ul>
        <li>Approve tutor profiles</li>
        <li>Review course listings</li>
        <li>Handle reports</li>
      </ul>

      <p class="hint">This section will be connected later.</p>
    </section>

    <!-- ===================== -->
<!-- 🔗 RESOURCES TAB -->
<!-- ===================== -->
<section v-if="activeTab === 'resources'" class="resources">
  <h2>Resources & Links</h2>
  <p class="hint">
    Add learning links (YouTube/Scribd/Twinkl), fun links, assignments, meeting links, and reminders.
  </p>

  <div class="resource-form">
    <input v-model="resourceForm.title" class="search" placeholder="Title (e.g. Maths Worksheet, Zoom Link)" />
    <select v-model="resourceForm.type" class="search">
      <option value="meeting">Meeting Link</option>
      <option value="reminder">Reminder</option>
      <option value="assignment">Assignment Link</option>
      <option value="study">Study Material</option>
      <option value="fun">Fun Link</option>
      <option value="lesson-plan">Lesson Plan</option>
      <option value="youtube">YouTube Page</option>
      <option value="tutorial">Tutorial</option>
    </select>
    <select v-model="resourceForm.audienceRole" class="search">
    <option value="all">Everyone (All roles)</option>
    <option value="student">Students</option>
    <option value="parent">Parents</option>
    <option value="tutor">Tutors</option>
  </select>

   <input v-model="resourceForm.url" class="search" placeholder="URL (https://...) or leave blank if uploading a file" />

<input
  type="file"
  class="search"
  @change="onResourceFileChange"
/>

<button
  type="button"
  @click="uploadResourceFile"
  :disabled="!resourceForm.title || !resourceForm.type || !resourceFile"
>
  Upload File
</button>

    <input v-model="resourceForm.notes" class="search" placeholder="Notes (optional)" />
    <button @click="addResource" :disabled="!resourceForm.title || !resourceForm.type">
      Add
    </button>
  </div>

  <div class="assign-box">
  <div class="assign-head">
    <div>
      <strong>Assign to specific users (optional)</strong>
      <div class="hint">
        If you don’t select anyone, this resource is visible to the whole audience group.
      </div>
    </div>

    <div class="assign-meta">
      Selected: <span class="badge">{{ assignedToCount }}</span>
    </div>
  </div>

  <div class="assign-tools">
    <input
      v-model="resourceAssignSearch"
      class="search"
      placeholder="Search users to assign..."
    />
    <button class="danger" type="button" @click="resourceForm.assignedTo = []" :disabled="assignedToCount === 0">
      Clear
    </button>
  </div>

  <div v-if="usersLoading" class="hint">Loading users...</div>

  <div v-else class="assign-list">
    <label v-for="u in assignableUsers" :key="u._id" class="assign-item">
      <input
        type="checkbox"
        :value="u._id"
        v-model="resourceForm.assignedTo"
      />
      <span class="assign-name">{{ u.name }}</span>
      <span class="assign-email">{{ u.email }}</span>
      <span class="badge">{{ u.role }}</span>
    </label>

    <div v-if="assignableUsers.length === 0" class="hint">
      No users match this audience/search.
    </div>
  </div>
</div>


  <div class="resource-filters">
    <input v-model="resourceSearch" class="search" placeholder="Search resources..." />
    <select v-model="resourceFilter" class="search">
      <option value="all">All</option>
      <option value="meeting">Meeting Links</option>
      <option value="reminder">Reminders</option>
      <option value="assignment">Assignments</option>
      <option value="study">Study Materials</option>
      <option value="fun">Fun Links</option>
      <option value="lesson-plan">Lesson Plans</option>
      <option value="youtube">YouTube</option>
      <option value="tutorial">Tutorials</option>
    </select>
  </div>

  <p v-if="filteredResources.length === 0">No resources yet.</p>

  <table v-if="filteredResources.length">
    <thead>
      <tr>
        <th>Title</th>
        <th>Type</th>
        <th>Link</th>
        <th>Notes</th>
        <th>Audience</th>
        <th>Assigned</th>
        <th>Actions</th>


      </tr>
    </thead>
    <tbody>
      <tr v-for="r in filteredResources" :key="r._id">
        <td>{{ r.title }}</td>
        <td><span class="badge">{{ prettyType(r.type) }}</span></td>
        <td>
      <a
        v-if="r.file?.url"
        :href="`http://localhost:5000${r.file.url}`"
        target="_blank"
        rel="noreferrer"
      >
        Download File
      </a>

      <a
        v-else-if="r.url"
        :href="r.url"
        target="_blank"
        rel="noreferrer"
      >
        Open Link
      </a>

      <span v-else>-</span>
</td>

        <td>{{ r.notes || "-" }}</td>
        <td><span class="badge">{{ r.audienceRole }}</span></td>
        <td>
           <span v-if="r.assignedTo?.length">
           {{ r.assignedTo.map(u => u?.name || u).join(", ") }}
           </span>
          <span v-else>All</span>
        </td>


        <td>
          <button class="danger" @click="removeResource(r._id)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</section>


    <!-- ===================== -->
    <!-- 💳 PAYMENTS TAB -->
    <!-- ===================== -->
    <section v-if="activeTab === 'payments'">
  <h2>Tutor Payments</h2>

  <p v-if="paymentsLoading">Loading payments...</p>

  <table v-if="tutorPayments.length">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Hourly Rate</th>
        <th>Hours</th>
        <th>Sessions</th>
        <th>Total Earnings</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="t in tutorPayments" :key="t._id">
        <td>{{ t.name }}</td>
        <td>{{ t.email }}</td>
        <td>£{{ t.hourlyRate || 20 }}</td>
        <td>{{ t.totalHours }}</td>
        <td>{{ t.totalSessions }}</td>
        <td><strong>£{{ t.totalEarnings }}</strong></td>

        <td>
          <button @click="markAsPaid(t)">Mark Paid</button>
        </td>
      </tr>
    </tbody>
  </table>

  <p v-if="!paymentsLoading && tutorPayments.length === 0">
    No tutor data yet.
  </p>
</section>

<!-- 💰 PAYMENT HISTORY TAB -->
<section v-if="activeTab === 'payment-history'">
  <h2>Payment History</h2>

  <p v-if="historyLoading">Loading payment history...</p>

  <table v-if="paymentHistory.length">
    <thead>
      <tr>
        <th>Tutor</th>
        <th>Amount</th>
        <th>Sessions</th>
        <th>Paid By</th>
        <th>Date</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="p in paymentHistory" :key="p._id">
        <td>{{ p.tutorId?.name }}</td>
        <td>£{{ p.amount }}</td>
        <td>{{ p.sessions?.length }}</td>
        <td>{{ p.paidBy?.name }}</td>
        <td>{{ new Date(p.paidAt).toLocaleString() }}</td>
      </tr>
    </tbody>
  </table>

  <p v-if="!historyLoading && paymentHistory.length === 0">
    No payment history yet.
  </p>
</section>
  </DashboardLayout>
</template>


<script>
import DashboardLayout from "../components/DashboardLayout.vue";
import AdminNav from "../components/nav/AdminNav.vue";
import axios from "axios";

export default {
  components: { DashboardLayout, AdminNav },

  data() {
    return {
      activeTab: "dashboard",
      users: [],
      allUsers: [],
      usersLoading: false,
      userSearch: "",

      loading: true,
      message: {
        text: "",
        type: "" // success | error
      },

      resources: [],
      resourceForm: { title: "", type: "study", url: "", notes: "", audienceRole: "all", assignedTo: [] },
      resourceAssignSearch: "",

      resourceSearch: "",
      resourceFilter: "all",
      resourcesLoading: false,
      resourceFile: null,
      tutorPayments: [],
      paymentsLoading: false,
      paymentHistory: [],
      historyLoading: false
      

    };
  },

  computed: {
  filteredApprovedUsers() {
    const q = this.userSearch.trim().toLowerCase();
    if (!q) return this.allUsers;

    return this.allUsers.filter(u =>
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  },
  filteredResources() {
  const q = this.resourceSearch.trim().toLowerCase();
  const type = this.resourceFilter;

  return this.resources.filter(r => {
    const matchesType = type === "all" || r.type === type;
    const matchesQ =
      !q ||
      (r.title || "").toLowerCase().includes(q) ||
      (r.notes || "").toLowerCase().includes(q) ||
      (r.url || "").toLowerCase().includes(q);

    return matchesType && matchesQ;
  });
},

assignableUsers() {
  // Uses your allUsers list (approved users) — make sure it's loaded at least once
  const role = this.resourceForm.audienceRole;

  let list = this.allUsers || [];
  if (role !== "all") {
    list = list.filter(u => u.role === role);
  }

  const q = (this.resourceAssignSearch || "").trim().toLowerCase();
  if (!q) return list;

  return list.filter(u =>
    (u.name || "").toLowerCase().includes(q) ||
    (u.email || "").toLowerCase().includes(q)
  );
},

assignedToCount() {
  return (this.resourceForm.assignedTo || []).length;
},


},


  created() {
  this.activeTab = localStorage.getItem("adminTab") || "dashboard";

  this.fetchPendingUsers();

  //this.fetchResources();

  this._touch = () => localStorage.setItem("lastActiveAt", String(Date.now()));

  window.addEventListener("mousemove", this._touch);
  window.addEventListener("keydown", this._touch);
  window.addEventListener("click", this._touch);

  window.addEventListener("scroll", this._touch, { passive: true });
  window.addEventListener("touchstart", this._touch, { passive: true });

 
},
beforeUnmount() {
  window.removeEventListener("mousemove", this._touch);
  window.removeEventListener("keydown", this._touch);
  window.removeEventListener("click", this._touch);

  window.removeEventListener("scroll", this._touch);
  window.removeEventListener("touchstart", this._touch);
},


watch: {
  activeTab(tab) {
    if (tab === "dashboard") {
      this.fetchPendingUsers();
    }

    if (tab === "users" && this.allUsers.length === 0) {
      this.fetchApprovedUsers();
    }

    if (tab === "resources" && this.resources.length === 0) {
      this.fetchResources();
    }

    if (tab === "resources" && this.allUsers.length === 0) {
      this.fetchApprovedUsers();
    }
    if (tab === "payments" && this.tutorPayments.length === 0) {
  this.fetchTutorPayments();
}

    if (tab === "payment-history" && this.paymentHistory.length === 0) {
  this.fetchPaymentHistory();
   }
  },

  // ✅ clear selections when audience group changes
  "resourceForm.audienceRole"(newRole, oldRole) {
    if (newRole !== oldRole) {
      this.resourceForm.assignedTo = [];
      this.resourceAssignSearch = "";
    }
  }
},


  methods: {
    async fetchPendingUsers() {
      const token = localStorage.getItem("token");
      if (!token) return this.$router.replace("/");

      this.loading = true;

      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/admin/users/pending",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.users = res.data;
      } catch (err) {
        console.error(err);
        this.showMessage("Failed to load pending users", "error");
      } finally {
        this.loading = false;
      }
    },

    async approve(user) {
      const token = localStorage.getItem("token");
      if (!token) return this.$router.replace("/");

      try {
        const token = localStorage.getItem("token");

        await axios.put(
          `http://localhost:5000/api/admin/users/${user._id}/approve`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.showMessage(
          `✅ ${user.name} approved. Email notification sent.`,
          "success"
        );

        this.fetchPendingUsers();
      } catch (err) {
        console.error(err);
        this.showMessage("Failed to approve user", "error");
      }
    },

    async reject(user) {
      const token = localStorage.getItem("token");
      if (!token) return this.$router.replace("/");

      if (!confirm(`Reject and remove ${user.name}?`)) return;

      try {
        const token = localStorage.getItem("token");

        await axios.delete(
          `http://localhost:5000/api/admin/users/${user._id}/reject`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.showMessage(
          `❌ ${user.name} rejected. Email notification sent.`,
          "success"
        );

        this.fetchPendingUsers();
      } catch (err) {
        console.error(err);
        this.showMessage("Failed to reject user", "error");
      }
    },

    async fetchApprovedUsers() {
  const token = localStorage.getItem("token");
  if (!token) return this.$router.replace("/");

  this.usersLoading = true;

  try {
    const res = await axios.get(
      "http://localhost:5000/api/admin/users/approved",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    this.allUsers = res.data;
  } catch (err) {
    console.error(err);
    this.showMessage("Failed to load approved users", "error");
  } finally {
    this.usersLoading = false;
  }
},


    showMessage(text, type = "success") {
      this.message.text = text;
      this.message.type = type;

      setTimeout(() => {
        this.message.text = "";
        this.message.type = "";
      }, 5000);
    },

    async fetchResources() {
  const token = localStorage.getItem("token");
  if (!token) return this.$router.replace("/");

  this.resourcesLoading = true;
  try {
    const res = await axios.get("http://localhost:5000/api/admin/resources", {
      headers: { Authorization: `Bearer ${token}` }
    });
    this.resources = res.data;
  } catch (err) {
    console.error(err);
    this.showMessage("Failed to load resources", "error");
  } finally {
    this.resourcesLoading = false;
  }
},

async addResource() {
  const token = localStorage.getItem("token");
  if (!token) return this.$router.replace("/");

  const payload = {
    title: this.resourceForm.title.trim(),
    type: this.resourceForm.type,
    url: this.resourceForm.url.trim(),
    notes: this.resourceForm.notes.trim(),
    audienceRole: this.resourceForm.audienceRole,
    assignedTo: this.resourceForm.assignedTo
  };

  if (!payload.title || !payload.type) return;

  try {
    const res = await axios.post("http://localhost:5000/api/admin/resources", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // put new item at top
    this.resources.unshift(res.data);

    this.resourceForm = {
  title: "",
  type: this.resourceForm.type,
  url: "",
  notes: "",
  audienceRole: this.resourceForm.audienceRole,
  assignedTo: []
};
this.resourceAssignSearch = "";

    this.showMessage("Resource added ✅", "success");
  } catch (err) {
    console.error(err);
    this.showMessage("Failed to add resource", "error");
  }
},

async removeResource(id) {
  const token = localStorage.getItem("token");
  if (!token) return this.$router.replace("/");

  try {
    await axios.delete(`http://localhost:5000/api/admin/resources/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    this.resources = this.resources.filter(r => r._id !== id);
    this.showMessage("Resource deleted", "success");
  } catch (err) {
    console.error(err);
    this.showMessage("Failed to delete resource", "error");
  }
},

onResourceFileChange(e) {
  const file = e.target.files?.[0] || null;
  this.resourceFile = file;
},

async uploadResourceFile() {
  const token = localStorage.getItem("token");
  if (!token) return this.$router.replace("/");

  if (!this.resourceFile) return;

  try {
    const fd = new FormData();

    fd.append("title", this.resourceForm.title.trim());
    fd.append("type", this.resourceForm.type);
    fd.append("url", this.resourceForm.url.trim());
    fd.append("notes", this.resourceForm.notes.trim());
    fd.append("audienceRole", this.resourceForm.audienceRole);

    // send assignedTo as JSON string
    fd.append("assignedTo", JSON.stringify(this.resourceForm.assignedTo || []));

    // file MUST be named "file" (matches multer.single("file"))
    fd.append("file", this.resourceFile);

    const res = await axios.post("http://localhost:5000/api/admin/resources/upload", fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    // newest first
    this.resources.unshift(res.data);

    // reset form + file
    this.resourceForm.title = "";
    this.resourceForm.url = "";
    this.resourceForm.notes = "";
    this.resourceForm.assignedTo = [];
    this.resourceAssignSearch = "";
    this.resourceFile = null;

    this.showMessage("File uploaded ✅", "success");
  } catch (err) {
    console.error(err);
    this.showMessage(err.response?.data?.message || "Upload failed", "error");
  }
},
async fetchTutorPayments() {
  const token = localStorage.getItem("token");
  if (!token) return;

  this.paymentsLoading = true;

  try {
    const res = await axios.get(
      "http://localhost:5000/api/admin/tutor-payments",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    this.tutorPayments = res.data;
  } catch (err) {
    console.error(err);
    this.showMessage("Failed to load tutor payments", "error");
  } finally {
    this.paymentsLoading = false;
  }
},

prettyType(type) {
  const map = {
    meeting: "Meeting Link",
    reminder: "Reminder",
    assignment: "Assignment",
    study: "Study Material",
    fun: "Fun Link",
    "lesson-plan": "Lesson Plan",
    youtube: "YouTube",
    tutorial: "Tutorial"
  };
  return map[type] || type;
},
async markAsPaid(tutor) {
  const token = localStorage.getItem("token");
  if (!token) return this.$router.replace("/");

  try {
    await axios.put(
      `http://localhost:5000/api/admin/tutor-payments/${tutor._id}/mark-paid`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    this.showMessage(`${tutor.name} marked as paid`, "success");

    // refresh list
    this.fetchTutorPayments();

  } catch (err) {
    console.error(err);
    this.showMessage("Failed to mark as paid", "error");
  }
},

async fetchPaymentHistory() {
  const token = localStorage.getItem("token");
  if (!token) return;

  this.historyLoading = true;

  try {
    const res = await axios.get(
      "http://localhost:5000/api/admin/payment-history",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    this.paymentHistory = res.data;
  } catch (err) {
    console.error(err);
    this.showMessage("Failed to load payment history", "error");
  } finally {
    this.historyLoading = false;
  }
}

  }
};
</script>

<style scoped>

  /* Ensure dashboard uses full width */
:host,
:root {
  width: 100%;
}
section {
  width: 100%;
}

/* ✅ Theme overrides for ADMIN (other dashboards can use different overrides) */
:deep(.layout) {
  --bg1: #eef2ff;
  --bg2: #ecfeff;
  --primary: #4f46e5;
  --primary2: #06b6d4;
}

/* Page header */
h1 {
  margin: 6px 0 6px;
  font-size: 28px;
  letter-spacing: -0.02em;
}
.page-subtitle {
  color: rgba(71, 85, 105, 0.95);
  margin-bottom: 18px;
}

/* Sections become "cards" */
.approvals,
.users,
section {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(15, 23, 42, 0.10);
  border-radius: 14px;
  padding: 16px;
  margin-top: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

h2 {
  margin: 0 0 12px;
}

/* ✅ Message banner (modern) */
.message {
  padding: 12px 14px;
  margin-bottom: 14px;
  border-radius: 12px;
  font-weight: 600;
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

/* ✅ Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  overflow: hidden;
  border-radius: 12px;
}

thead th {
  text-align: left;
  font-size: 13px;
  color: rgba(71, 85, 105, 0.95);
  background: rgba(248, 250, 252, 0.9);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

tbody tr:hover {
  background: rgba(99, 102, 241, 0.06);
}

/* ✅ Buttons */
button {
  border: 1px solid rgba(79, 70, 229, 0.35);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(6, 182, 212, 0.10));
  color: #0f172a;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.08s ease, filter 0.15s ease;
}

button:hover {
  filter: brightness(0.98);
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

button.danger {
  border-color: rgba(220, 53, 69, 0.35);
  background: rgba(220, 53, 69, 0.12);
  color: #b21f2d;
}

/* ✅ Users tab tools */
.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.users-tools {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search {
  padding: 9px 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
  min-width: 260px;
  background: rgba(255, 255, 255, 0.7);
  outline: none;
}

.search:focus {
  border-color: rgba(79, 70, 229, 0.45);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.10);
}

/* Role badges */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid rgba(15, 23, 42, 0.10);
  background: rgba(248, 250, 252, 0.9);
}

.badge.role-admin {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.10);
}
.badge.role-tutor {
  border-color: rgba(6, 182, 212, 0.35);
  background: rgba(6, 182, 212, 0.10);
}
.badge.role-parent,
.badge.role-student {
  border-color: rgba(79, 70, 229, 0.30);
  background: rgba(79, 70, 229, 0.08);
}

/* Mobile spacing */
@media (max-width: 720px) {
  .search { min-width: 180px; width: 100%; }
  .users-tools { width: 100%; }
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}

.assign-box {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.10);
  background: rgba(248, 250, 252, 0.7);
}

.assign-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.assign-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.assign-tools {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.assign-list {
  display: grid;
  gap: 8px;
  max-height: 240px;
  overflow: auto;
  padding-right: 6px;
}

.assign-item {
  display: grid;
  grid-template-columns: 18px 1fr 1.2fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  background: rgba(255,255,255,0.85);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.assign-name {
  font-weight: 800;
}

.assign-email {
  color: rgba(71, 85, 105, 0.95);
  font-size: 13px;
}

@media (max-width: 900px) {
  .assign-item {
    grid-template-columns: 18px 1fr;
  }
  .assign-email {
    grid-column: 2 / -1;
  }
}

</style>
