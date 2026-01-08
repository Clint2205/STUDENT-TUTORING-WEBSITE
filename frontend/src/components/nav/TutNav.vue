<template>
  <nav class="nav">
    <router-link to="/tutor">Dashboard</router-link>
    <router-link to="/tutor/schedule">Schedule</router-link>
    <router-link to="/tutor/stats">Stats</router-link>
    <router-link to="/tutor/assignments">Assignments</router-link>
  </nav>
</template>

<script>
export default {
  name: "TutNav"
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