<script lang="ts">
  import { api } from "$lib/api";
  import { formatDuration } from "$lib/utils/format-duration";
  import { onMount } from "svelte";

  let servicesType: { id: string; name: string }[] = [];
  let servicesSearched: any[] = [];
  let query = "";
  let loading = false;
  let errorMessage = "";

  onMount(async () => {
    await fetchServicesType();
  });

  async function fetchServicesType() {
    try {
      const res = await api.get("/service/list-types");
      servicesType = res.data.servicesType;
    } catch (err) {
      errorMessage = "Erro ao carregar categorys.";
    }
  }

  async function searchServices() {
    if (!query.trim()) return;
    loading = true;
    errorMessage = "";
    try {
      const res = await api.get(
        `/service/search?query=${encodeURIComponent(query)}`
      );

      servicesSearched = [...res.data.servicesVariation];
    } catch (err) {
      errorMessage = "Erro ao buscar serviços.";
    } finally {
      loading = false;
    }
  }

  async function filterByType(typeId: string) {
    loading = true;
    errorMessage = "";
    query = "";
    try {
      const res = await api.get(`/service/by-type?typeId=${typeId}`);
      servicesSearched = res.data.servicesVariation || [];
    } catch (err) {
      errorMessage = "Erro ao filtrar serviços.";
    } finally {
      loading = false;
    }
  }
</script>

<main>
  <div class="md:text-black mb-2">
    <form
      on:submit|preventDefault={searchServices}
      class="flex gap-2 w-full md:max-w-1/3"
    >
      <input
        type="text"
        placeholder="Buscar serviços (ex.: pintor, jardinagem)"
        bind:value={query}
        class="flex-1 border rounded-lg p-1"
      />
      <button
        type="submit"
        class="bg-green-600 text-white px-2 py-1 rounded-lg"
        disabled={loading}
      >
        {loading ? "Buscando..." : "Buscar"}
      </button>
    </form>
  </div>

  <section class="my-4">
    <h2 class="mb-2">Procura por?</h2>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 overflow-auto h-56 p-1 border-b border-zinc-300"
    >
      {#each servicesType as category}
        <button
          class="p-2 rounded-lg shadow hover:shadow-md cursor-pointer bg-white"
          on:click={() => filterByType(category.id)}
        >
          <p class="font-semibold text-sm">{category.name}</p>
        </button>
      {/each}
    </div>
  </section>

  <section>
    {#if errorMessage}
      <p class="text-red-500">{errorMessage}</p>
    {/if}

    {#if loading}
      <p>Carregando serviços...</p>
    {:else if servicesSearched.length === 0}
      <p class="text-gray-500">Nenhum serviço encontrado.</p>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {#each servicesSearched as service}
          <a
            href={`/service-details/${service.serviceId}`}
            class="block rounded-lg p-1 shadow hover:shadow-md bg-white"
          >
            <h3 class="mb-2">{service.name}</h3>
            <p class="text-sm text-gray-600 mb-2">
              Preço: R$ {(service.priceCents / 100).toFixed(2)} | Duração:
              {formatDuration(service.durationMinutes)}
            </p>
          </a>
        {/each}
      </div>
    {/if}
  </section>
</main>
