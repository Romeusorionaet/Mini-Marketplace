<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { formatDatetime } from "$lib/utils/format-datetime";
  import { highlightBookingId } from "$lib/stores/notifications";

  interface ServiceVariation {
    id: string;
    serviceId: string;
    name: string;
    priceCents: number;
    durationMinutes: number;
  }

  interface Availability {
    id: string;
    providerId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }

  interface Booking {
    id: string;
    providerEmail: string;
    serviceVariation: ServiceVariation;
    availability: Availability;
    status: string;
    createdAt: string;
    updatedAt: string;
  }

  let bookings: Booking[] = [];
  let loading = true;
  let error = "";

  async function fetchBookings() {
    try {
      const res = await api.get("/booking/list/client");
      bookings = res.data.clientBookings;
      bookings.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err: any) {
      error = err?.response?.data?.message || "Erro ao buscar reservas";
    } finally {
      loading = false;
    }
  }

  function formatPrice(cents: number) {
    return `R$ ${(cents / 100).toFixed(2)}`;
  }

  function clearHighlight() {
    highlightBookingId.set(null);
  }

  onMount(() => {
    fetchBookings();
  });
</script>

<main class="p-4">
  <div class="flex justify-between">
    <button
      class="mb-4 text-blue-600 hover:underline"
      on:click={() => history.back()}
    >
      &larr; Voltar
    </button>
    <h1 class="text-2xl font-bold mb-4">Minhas Reservas</h1>
  </div>

  {#if loading}
    <p>Carregando...</p>
  {:else if error}
    <p class="text-red-500">{error}</p>
  {:else if bookings.length === 0}
    <p>Nenhuma reserva encontrada.</p>
  {:else}
    <div class="flex gap-2 flex-col overflow-auto h-[800px] px-2 pb-10">
      {#each bookings as b}
        <button
          class="p-2 rounded shadow hover:shadow-xl text-left bg-white cursor-pointer"
          class:bg-yellow-100={$highlightBookingId === b.id}
          on:click={clearHighlight}
        >
          <p><strong>Prestador:</strong> {b.providerEmail}</p>
          <p><strong>Serviço:</strong> {b.serviceVariation.name}</p>
          <p>
            <strong>Preço:</strong>
            {formatPrice(b.serviceVariation.priceCents)}
          </p>
          <p>
            <strong>Duração:</strong>
            {b.serviceVariation.durationMinutes} min
          </p>
          <p>
            <strong>Agendamento:</strong>
            {formatDatetime(b.availability.startTime)} - {formatDatetime(
              b.availability.endTime
            )}
          </p>
          <p><strong>Status:</strong> {b.status}</p>
          <p><strong>Criado em:</strong> {formatDatetime(b.createdAt)}</p>
        </button>
      {/each}
    </div>
  {/if}
</main>
