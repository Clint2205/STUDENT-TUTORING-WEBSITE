<template>
  <nav class="nav">
    <router-link to="/admin">Dashboard</router-link>
    <router-link to="/admin/users">Users</router-link>
    <router-link to="/admin/content">Content</router-link>
    <router-link to="/admin/payments">Payments</router-link>
  </nav>
</template>

<script>
export default {
  name: "AdminNav"
}
</script>

<style scoped>
.nav {
  display: flex;
  gap: 15px;
  background: #f4f4f4;
  padding: 15px;
}
</style>
