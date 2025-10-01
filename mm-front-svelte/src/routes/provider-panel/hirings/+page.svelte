<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { LoaderCircle } from "lucide-svelte";
  import type { BookingProviderType } from "../../../@types/booking-provider.type";

  let bookings: BookingProviderType[] = [];
  let loading = true;
  let errorMessage = "";
  let cancelingId: string | null = null;

  async function fetchProviderBookings() {
    try {
      const res = await api.get("/booking/list/provider");
      bookings = res.data.bookingsProvider;
      bookings.sort(
        (a, b) =>
          new Date(b.bookings.createdAt).getTime() -
          new Date(a.bookings.createdAt).getTime()
      );
    } catch (err: any) {
      errorMessage =
        err.response?.data?.message || "Erro ao carregar bookings.";
    } finally {
      loading = false;
    }
  }

  async function cancelBooking(bookingId: string) {
    if (!confirm("Deseja realmente cancelar esta contratação?")) return;

    cancelingId = bookingId;
    try {
      await api.patch(`/booking/cancel?bookingId=${bookingId}`);
      alert("Contratação cancelada com sucesso!");
      await fetchProviderBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao cancelar a contratação.");
    } finally {
      cancelingId = null;
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString();
  }

  onMount(() => {
    fetchProviderBookings();
  });
</script>

{#if loading}
  <LoaderCircle class="animate-spin" /> Carregando...
{:else if errorMessage}
  <p class="text-red-500">{errorMessage}</p>
{:else if bookings.length === 0}
  <p>Nenhuma contratação confirmada encontrada.</p>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
    {#each bookings as b}
      <div class="p-4 rounded shadow bg-white">
        <div>
          <h3 class="font-semibold mb-1">{b.service_variations.name}</h3>
          <p><strong>Cliente:</strong> {b.users.name} ({b.users.email})</p>
          <p><strong>Cidade:</strong> {b.users.city}</p>
          <p>
            <strong>Data:</strong>
            {formatDate(b.availabilities.startTime)} |
            <strong>Horário:</strong>
            {formatTime(b.availabilities.startTime)} - {formatTime(
              b.availabilities.endTime
            )}
          </p>
          <p>
            <strong>Duração:</strong>
            {b.service_variations.durationMinutes} min
          </p>
          <p><strong>Status:</strong> {b.bookings.status}</p>
          <p>
            <strong>Criado em:</strong>
            {formatDate(b.bookings.createdAt)}
            {formatTime(b.bookings.createdAt)}
          </p>
        </div>

        {#if b.bookings.status !== "CANCELLED"}
          <button
            class="mt-2 bg-red-400 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
            on:click={() => cancelBooking(b.bookings.id)}
            disabled={cancelingId === b.bookings.id}
          >
            {cancelingId === b.bookings.id ? "Cancelando..." : "Cancelar"}
          </button>
        {/if}
      </div>
    {/each}
  </div>
{/if}
