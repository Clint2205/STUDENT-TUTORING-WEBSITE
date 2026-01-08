<template>
  <nav class="nav">
    <router-link to="/student">Dashboard</router-link>
    <router-link to="/student/assignments">Assignments</router-link>
    <router-link to="/student/schedule">Schedule</router-link>
    <router-link to="/student/media">Media</router-link>
  </nav>
</template>

<script>
export default {
  name: "StudentNav"
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