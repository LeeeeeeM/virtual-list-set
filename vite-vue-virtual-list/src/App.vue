<script setup lang="ts">
import WaterFallWasm from "./components/WaterFallWasm/WaterFall.vue";
import WaterFallJs from "./components/WaterFallJs/WaterFall.vue";

const searchParams = new URLSearchParams(location.search);
const jsParams = searchParams.get("useJs");
const useJs = jsParams === "true" || jsParams === "";
</script>

<template>
  <div>
    <WaterFallWasm v-if="!useJs" />
    <WaterFallJs v-if="useJs" />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
