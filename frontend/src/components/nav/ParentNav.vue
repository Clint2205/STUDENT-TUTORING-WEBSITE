<template>
  <nav class="nav">
    <router-link to="/parent">Dashboard</router-link>
    <router-link to="/parent/assignments">Assignments</router-link>
    <router-link to="/parent/schedule">Schedule</router-link>
    <router-link to="/parent/payments">Payments</router-link>
  </nav>
</template>

<script>
export default {
  name: "ParentNav"
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
