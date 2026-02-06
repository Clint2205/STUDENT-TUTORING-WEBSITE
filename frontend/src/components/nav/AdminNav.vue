<template>
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
</style>
