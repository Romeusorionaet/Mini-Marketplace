<script lang="ts">
  export let data: {
    history: HistoryProviderType[];
    errorMessage: string;
  };

  function formatDate(d: string) {
    return new Date(d).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }
</script>

<main>
  <h1 class="text-2xl font-bold mb-4">Histórico de Contratações</h1>

  {#if data.errorMessage}
    <p class="text-red-500">{data.errorMessage}</p>
  {:else if data.errorMessage}
    <p class="text-red-600">{data.errorMessage}</p>
  {:else if history && history.length === 0}
    <p class="text-gray-600">Nenhuma contratação encontrada.</p>
  {:else}
    <ul class="space-y-4">
      {#each data.history as booking}
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
