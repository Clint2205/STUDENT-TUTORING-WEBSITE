<template>
  <DashboardLayout>
    <template #nav>
      <StudentNav />
    </template>

    <h1>Student Dashboard</h1>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '../components/DashboardLayout.vue'
import StudentNav from '../components/nav/StudentNav.vue'

export default {
  components: { DashboardLayout, StudentNav }
}
</script>
