<template>
  <DashboardLayout>
    <template #nav>
      <AdminNav />
    </template>

    <h1>Admin Dashboard</h1>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '../components/DashboardLayout.vue'
import AdminNav from '../components/nav/AdminNav.vue'

export default {
  components: { DashboardLayout, AdminNav }
}
</script>
