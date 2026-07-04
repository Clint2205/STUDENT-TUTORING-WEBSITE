// ParentNav.vue: This component defines the navigation bar for the parent dashboard. It includes links to the main sections of the parent dashboard, such as Dashboard, Assignments, Schedule, and Payments. This component is used within the ParentDashboard.vue to provide consistent navigation across all parent-related pages.

<template>
  <nav class="nav">
    <router-link to="/parent">Dashboard</router-link>
   
   
    <router-link to="/parent/schedule">
  Bookings
</router-link>
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
