<template>
  <DashboardLayout>
    <template #nav>
      <TutNav />
    </template>

    <h1>Tutor Dashboard</h1>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '../components/DashboardLayout.vue'
import TutNav from '../components/nav/TutNav.vue'

export default {
  components: { DashboardLayout, TutNav }
}
</script>
