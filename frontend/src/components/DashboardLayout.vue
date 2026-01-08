<template>
  <div class="layout">
    <slot name="nav"></slot>

    <main class="content">
      <slot></slot>
    </main>
  </div>
</template>

<script>
export default {
  name: "DashboardLayout"
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
}

.content {
  padding: 20px;
}
</style>
