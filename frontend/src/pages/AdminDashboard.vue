<template>
  <DashboardLayout>
    <template #nav>
      <AdminNav />
    </template>

    <!-- ✅ STATUS MESSAGE BANNER -->
    <div
      v-if="message.text"
      :class="['message', message.type]"
    >
      {{ message.text }}
    </div>

    <h1>Admin Dashboard</h1>

    <section class="approvals">
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
              <button @click="approve(user)">
                Approve
              </button>

              <button class="danger" @click="reject(user)">
                Reject
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
      users: [],
      loading: true,
      message: {
        text: "",
        type: "" // success | error
      }
    };
  },

  created() {
  this.fetchPendingUsers();

  // refresh activity on user interactions in this page
  this._touch = () => localStorage.setItem("lastActiveAt", String(Date.now()));
  window.addEventListener("mousemove", this._touch);
  window.addEventListener("keydown", this._touch);
  window.addEventListener("click", this._touch);
},
beforeUnmount() {
  window.removeEventListener("mousemove", this._touch);
  window.removeEventListener("keydown", this._touch);
  window.removeEventListener("click", this._touch);
},


  methods: {
    async fetchPendingUsers() {
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
.approvals {
  margin-top: 30px;
}

/* ✅ MESSAGE BANNER */
.message {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 6px;
  font-weight: 500;
}

.message.success {
  background-color: #e6f7ec;
  color: #1e7e34;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #fdecea;
  color: #b21f2d;
  border: 1px solid #f5c6cb;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 10px;
}

button {
  padding: 6px 10px;
  margin-right: 5px;
  cursor: pointer;
}

button.danger {
  background-color: #dc3545;
  color: white;
}
</style>
