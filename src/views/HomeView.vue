<script setup lang="ts">
import TheWelcome from "../components/TheWelcome.vue";

const res = await fetch("/api/test", {
  method: "GET",
  mode: "cors",
  cache: "no-cache",
  credentials: "same-origin",
  headers: {
    "Content-Type": "application/json",
  },
});
const text = await res.json();
console.log(text);
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
