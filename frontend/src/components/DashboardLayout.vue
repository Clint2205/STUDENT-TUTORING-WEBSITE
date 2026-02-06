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
  min-height: 100vh;        /*full height */
  width: 100%;              /*full width */
  display: flex;
  flex-direction: column;

  /* theme variables  */
  --bg1: #eef2ff;
  --bg2: #ecfeff;
  --card: rgba(255,255,255,0.9);
  --border: rgba(15, 23, 42, 0.10);
  --text: #0f172a;
  --muted: #475569;

  --primary: #4f46e5;
  --primary2: #06b6d4;
  --danger: #dc3545;

  background:
    radial-gradient(1200px 600px at 10% 10%, var(--bg2), transparent 60%),
    radial-gradient(1000px 600px at 90% 0%, var(--bg1), transparent 55%),
    linear-gradient(180deg, #ffffff, #f8fafc);
}

/* Sticky nav stays at top */
:deep(.nav) {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 50;
}

/* Main content expands */
.content {
  flex: 1;                 /* 🔑 fills remaining height */
  width: 100%;             /* 🔑 full width */
  padding: 24px;

  display: block;          /* prevent centering */
}
</style>
