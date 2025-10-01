<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { api } from "$lib/api";
  import ClientCalendarAvailability from "$lib/components/client-calendar-availability.svelte";

  let service: any = null;
  let variations: any[] = [];
  let loading = true;
  let errorMessage = "";
  let schedule: any[] = [];
  let resetCalendar = false;

  let selectedVariationId: string | null = null;
  let messageErrorBookingService: string | null = null;

  function formatDuration(minutes: number) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  function selectVariation(id: string) {
    selectedVariationId = id;
    messageErrorBookingService = null;
  }

  async function fetchServiceDetails(serviceId: string) {
    if (!serviceId) {
      errorMessage = "Serviço não encontrado.";
      loading = false;
      return;
    }

    try {
      const res = await api.get(`/service/details?serviceId=${serviceId}`);
      service = res.data.service;
      variations = res.data.variations;
      await fetchProviderSchedule(service.providerId);
    } catch (err) {
      errorMessage = "Erro ao carregar detalhes do serviço.";
    } finally {
      loading = false;
    }
  }

  async function fetchProviderSchedule(providerId: string) {
    try {
      const res = await api.get(
        `/schedule/availability/list/provider?providerId=${providerId}`
      );
      schedule = [...res.data.availableSchedule];
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBook({ slot }: { slot: any }) {
    const { id, providerId } = slot;

    if (!selectedVariationId) {
      messageErrorBookingService = "Escolha um dos serviços abaixo";
      return;
    }

    const booking = {
      providerId,
      availabilityId: id,
      serviceVariationId: selectedVariationId,
    };

    try {
      const res = await api.post(`/booking/create`, booking);

      await fetchProviderSchedule(providerId);
      resetCalendar = true;
      selectedVariationId = null;

      alert(res.data.message);
    } catch (err: any) {
      messageErrorBookingService =
        err.response?.data?.message ?? "Erro desconhecido";
    }
  }

  onMount(() => {
    const { id } = page.params;
    fetchServiceDetails(id || "");
  });
</script>

<main>
  <button
    class="mb-4 text-blue-600 hover:underline"
    on:click={() => history.back()}
  >
    &larr; Voltar
  </button>

  {#if loading}
    <p>Carregando...</p>
  {:else if errorMessage}
    <p class="text-red-500">{errorMessage}</p>
  {:else}
    <div class="bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold mb-2">{service.name}</h1>
      <p class="text-gray-600 mb-4">{service.description}</p>

      {#if service.photos?.length}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {#each service.photos as photo}
            <img
              src={photo}
              alt="Foto do serviço"
              class="w-full h-40 object-cover rounded"
            />
          {/each}
        </div>
      {/if}

      <section>
        <h2 class="text-xl font-bold mt-8 mb-4">Agenda</h2>

        <ClientCalendarAvailability
          {schedule}
          resetSelection={resetCalendar}
          onBook={handleBook}
        />
      </section>

      <section>
        {#if messageErrorBookingService}
          <p class="text-red-500">{messageErrorBookingService}</p>
        {/if}

        <h2 class="text-xl font-bold my-4">Serviços</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {#each variations as v}
            <button
              on:click={() => selectVariation(v.id)}
              class={`rounded-lg p-4 shadow cursor-pointer transition-all
								${selectedVariationId === v.id ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white hover:shadow-md"}
							`}
            >
              <h3 class="font-semibold text-lg mb-2">{v.name}</h3>
              <p class="text-sm text-gray-600 mb-2">
                Preço: R$ {(v.priceCents / 100).toFixed(2)} | Duração: {formatDuration(
                  v.durationMinutes
                )}
              </p>
            </button>
          {/each}
        </div>
      </section>
    </div>
  {/if}
</main>
