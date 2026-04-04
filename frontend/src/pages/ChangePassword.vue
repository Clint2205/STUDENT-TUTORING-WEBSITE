<template>
  <div class="wrap">
    <div class="card">
      <h2>Set New Password</h2>

      <div v-if="message" class="message">{{ message }}</div>

      <form @submit.prevent="submit">
        <input
          type="password"
          v-model="password"
          placeholder="New password"
          required
        />

        <button type="submit">Update Password</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      password: "",
      message: "",
      userId: this.$route.query.userId
    };
  },
  methods: {
    async submit() {
      try {
        await axios.post("/api/auth/change-password", {
          userId: this.userId,
          newPassword: this.password
        });

        this.message = "Password updated ✅";

        setTimeout(() => {
          this.$router.push("/");
        }, 1500);
      } catch (err) {
        this.message = "Failed to update password";
      }
    }
  }
};
</script>