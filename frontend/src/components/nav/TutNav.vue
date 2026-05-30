<template>
  <nav class="nav">
    <router-link :class="linkClass('dashboard')" to="/tutor?tab=dashboard">Dashboard</router-link>
    <router-link :class="linkClass('students')" to="/tutor?tab=students">My Students</router-link>
    <router-link :class="linkClass('resources')" to="/tutor?tab=resources">Resources</router-link>
    <router-link :class="linkClass('bookings')" to="/tutor?tab=bookings">Bookings</router-link>
  </nav>
</template>

<script>
export default {
  name: "TutNav",
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
