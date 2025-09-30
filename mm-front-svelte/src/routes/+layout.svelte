<script lang="ts">
  import "../lib/styles/global.css";
  import favicon from "$lib/assets/favicon.svg";
  import Header from "$lib/components/header.svelte";
  import Schedule from "$lib/components/schedule.svelte";

  const { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="w-full max-w-[1600px] mx-auto p-2 md:p-4">
  <Header />

  <div class="fixed bottom-4 right-4">
    <Schedule label="Agenda" />
  </div>
  {@render children?.()}
</div>
