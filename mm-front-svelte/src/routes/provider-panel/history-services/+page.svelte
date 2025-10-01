<script lang="ts">
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { api } from "$lib/api";
  import { LoaderCircle } from "lucide-svelte";

  let loading = true;
  let errorMessage = "";
  let history: any[] = [];

  async function fetchHistory() {
    loading = true;
    errorMessage = "";
    try {
      const res = await api.get("/booking/history/provider");
      history = res.data.historyBookings;
      history.sort(
        (a, b) =>
          new Date(b.bookings?.createdAt).getTime() -
          new Date(a.bookings?.createdAt).getTime()
      );
    } catch (err: any) {
      errorMessage =
        err.response?.data?.message || "Erro ao carregar histórico.";
    } finally {
      loading = false;
    }
  }

  afterNavigate((nav) => {
    if (nav.to?.url.pathname?.startsWith("/provider-panel/history-services")) {
      fetchHistory();
    }
  });

  function formatDate(d: string) {
    return new Date(d).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  onMount(() => {
    fetchHistory();
  });
</script>

<main>
  <h1 class="text-2xl font-bold mb-4">Histórico de Contratações</h1>

  {#if loading}
    <div class="flex items-center gap-2">
      <LoaderCircle class="animate-spin" /> Carregando...
    </div>
  {:else if errorMessage}
    <p class="text-red-600">{errorMessage}</p>
  {:else if history && history.length === 0}
    <p class="text-gray-600">Nenhuma contratação encontrada.</p>
  {:else}
    <ul class="space-y-4">
      {#each history as booking}
        <li
          class={`p-4 rounded shadow ${
            booking.bookings?.status === "CANCELLED" ? "bg-red-200" : "bg-white"
          }`}
        >
          <div class="mb-2">
            <p class="font-semibold">Cliente</p>
            <p>Nome: {booking.users?.name}</p>
            <p>Email: {booking.users?.email}</p>
            <p>Cidade: {booking.users?.city}</p>
          </div>

          <div class="mb-2">
            <p class="font-semibold">Serviço</p>
            <p>{booking.service_variations?.name}</p>
            <p>Duração: {booking.service_variations?.durationMinutes} min</p>
            <p>
              Preço: R$ {(booking.service_variations?.priceCents || 0) / 100}
            </p>
          </div>

          <div class="mb-2">
            <p class="font-semibold">Contratação</p>
            <p>Status: {booking.bookings?.status}</p>
            <p>
              Data da contratação: {formatDate(booking.bookings?.createdAt)}
            </p>
          </div>

          <div>
            <p class="font-semibold">Agendado para</p>
            <p>
              {formatDate(booking.availabilities?.startTime)}
              —
              {formatDate(booking.availabilities?.endTime)}
            </p>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</main>
