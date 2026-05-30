<!-- <template>
  <nav class="nav">
    <div class="links">
      <router-link to="/admin">Dashboard</router-link>
      <router-link to="/admin/users">Users</router-link>
      <router-link to="/admin/content">Content</router-link>
      <router-link to="/admin/payments">Payments</router-link>
    </div>

    <button class="logout" @click="logout">Logout</button>
  </nav>
</template>

<script>
export default {
  name: "AdminNav",
  methods: {
    logout() {
  localStorage.setItem("logoutReason", "logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("lastActiveAt");
  this.$router.replace("/");
}


  }
};
</script>

<style scoped>
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  background: #f4f4f4;
  padding: 15px;
}

.links {
  display: flex;
  gap: 15px;
}

.logout {
  padding: 8px 12px;
  border: 1px solid #dc3545;
  background: #dc3545;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
}

.logout:hover {
  filter: brightness(0.95);
}
</style> -->

<template>
  <nav class="nav">
    <div class="links">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: modelValue === tab.key }"
        @click="$emit('update:modelValue', tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <button class="logout" @click="logout">Logout</button>
  </nav>
</template>

<script>
export default {
  props: {
    modelValue: { type: String, required: true }
  },
  emits: ["update:modelValue"],
  data() {
    return {
      tabs: [
        { key: "dashboard", label: "Dashboard" },
        { key: "users", label: "Users" },
        { key: "content", label: "Content" },
        { key: "payments", label: "Payments" },
        { key: "payment-history", label: "Payment History" },
        { key: "resources", label: "Resources" },
      ]
    };
  },
  methods: {
    logout() {
      localStorage.setItem("logoutReason", "logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("lastActiveAt");
      this.$router.replace("/");
    }
  }
};
</script>

<style scoped>
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  width: 100%;
}

.links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.links button {
  border: 1px solid rgba(15, 23, 42, 0.10);
  background: rgba(255, 255, 255, 0.7);
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  color: #0f172a;
  transition: transform 0.08s ease, filter 0.15s ease, border-color 0.15s ease;
}

.links button:hover {
  filter: brightness(0.98);
  transform: translateY(-1px);
}

.links button.active {
  border-color: rgba(79, 70, 229, 0.35);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.14), rgba(6, 182, 212, 0.12));
}

.logout {
  padding: 8px 12px;
  border: 1px solid rgba(220, 53, 69, 0.35);
  background: rgba(220, 53, 69, 0.10);
  color: #b21f2d;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 700;
  transition: filter 0.15s ease;
}

.logout:hover {
  filter: brightness(0.95);
}
</style>
