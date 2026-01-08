<template>
  <DashboardLayout>
    <template #nav>
      <ParentNav />
    </template>

    <h1>Parent Dashboard</h1>
    <p>Welcome, parent.</p>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '../components/DashboardLayout.vue'
import ParentNav from '../components/nav/ParentNav.vue'

export default {
  components: { DashboardLayout, ParentNav }
}
</script>
