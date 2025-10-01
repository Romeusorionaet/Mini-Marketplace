<script lang="ts">
  export let photos: string[] = [];
  let current = 0;

  function next() {
    current = (current + 1) % photos.length;
  }

  function prev() {
    current = (current - 1 + photos.length) % photos.length;
  }
</script>

{#if photos?.length}
  <div class="relative w-full h-full overflow-hidden rounded">
    <div
      class="flex h-full transition-transform duration-500 ease-in-out"
      style="transform: translateX(-{current * 100}%)"
    >
      {#each photos as photo}
        <div class="w-full h-full flex-shrink-0">
          <img
            src={photo}
            alt="Foto do serviço"
            class="w-full h-full object-cover"
          />
        </div>
      {/each}
    </div>

    <button
      on:click={prev}
      class="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded"
    >
      ‹
    </button>
    <button
      on:click={next}
      class="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded"
    >
      ›
    </button>

    <div class="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
      {#each photos as _, i}
        <div
          class="w-2 h-2 rounded-full"
          class:bg-white={i === current}
          class:bg-gray-400={i !== current}
        ></div>
      {/each}
    </div>
  </div>
{/if}
