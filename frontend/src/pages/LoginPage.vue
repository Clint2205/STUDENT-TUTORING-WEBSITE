<template>
  <div class="auth-page">

    <!-- ✅ STATUS MESSAGE BANNER -->
    <div v-if="message.text" :class="['message', message.type]">
      {{ message.text }}
    </div>

    <h1>{{ isRegister ? "Register" : "Login" }}</h1>

    <form @submit.prevent="handleSubmit">
      <input
        type="email"
        v-model="form.email"
        placeholder="Email"
        required
        :disabled="loading"
      />

      <input
        type="password"
        v-model="form.password"
        placeholder="Password"
        required
        :disabled="loading"
      />

      <input
        v-if="isRegister"
        type="text"
        v-model="form.name"
        placeholder="Full Name"
        required
        :disabled="loading"
      />

      <select
        v-if="isRegister"
        v-model="form.role"
        required
        :disabled="loading"
      >
        <option disabled value="">Select Role</option>
        <option value="parent">Parent</option>
        <option value="student">Student</option>
        <option value="tutor">Tutor</option>
        <option value="admin" v-if="!adminExists">Admin</option>
      </select>

      <button type="submit" :disabled="loading">
        <span v-if="loading" class="spinner"></span>
        <span v-if="loading">Processing...</span>
        <span v-else>{{ isRegister ? "Register" : "Login" }}</span>
      </button>
    </form>

    <p class="toggle" @click="!loading && (isRegister = !isRegister)">
      {{ isRegister ? "Already have an account? Login" : "No account? Register" }}
    </p>
  </div>
</template>

<script>
import { login, register } from "../services/authService";
import axios from "axios";

export default {
  name: "LoginPage",

  data() {
    return {
      isRegister: false,
      adminExists: false,
      loading: false,
      message: { text: "", type: "" }, // success | error
      form: { name: "", email: "", password: "", role: "" }
    };
  },

  async created() {
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

          this.showMessage("Registration successful! Please log in 🎉", "success");

          // Reset form but keep login mode
          this.isRegister = false;
          this.form.password = "";
          this.form.email = "";
          this.form.name = "";
          this.form.role = "";
        } else {
          // ✅ Login flow
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
.auth-page {
  max-width: 400px;
  margin: 60px auto;
  text-align: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.1);
}

.message {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
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

input,
select,
button {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  background-color: #007bff;
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

button:disabled {
  background-color: #9bbcf5;
  cursor: not-allowed;
}

.toggle {
  margin-top: 15px;
  cursor: pointer;
  color: #007bff;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
