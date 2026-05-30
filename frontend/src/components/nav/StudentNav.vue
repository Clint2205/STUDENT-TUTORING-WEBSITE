//StudentNav.vue - A navigation component for student dashboard pages, providing links to different sections like assignments, schedule, and media.

<template>
  <nav class="nav">
    <router-link :class="linkClass('dashboard')" to="/student?tab=dashboard">Dashboard</router-link>
    <router-link :class="linkClass('resources')" to="/student?tab=resources">Resources</router-link>
  
    <router-link :class="linkClass('bookings')" to="/student?tab=bookings">Bookings</router-link>
  </nav>
</template>

<script>
export default {
  name: "StudentNav",
  props: { activeTab: { type: String, default: "dashboard" } },
  methods: {
    linkClass(tab) {
      return ["tab", this.activeTab === tab ? "active" : ""]
    }
  }
}
</script>

<style scoped>
.nav {
  display: flex;
  gap: 15px;
  background: #f4f4f4;
  padding: 15px;
}
.tab {
  padding: 8px 10px;
  border-radius: 10px;
  text-decoration: none;
  color: #0f172a;
}
.active {
  background: #4f46e5;
  color: white;
}
</style>
