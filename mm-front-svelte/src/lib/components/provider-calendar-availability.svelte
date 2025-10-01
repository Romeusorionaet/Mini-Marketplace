<script lang="ts">
  export let schedule: any[] = [];
  export let initialDate: Date | string = new Date();
  export let resetSelection: boolean = false;
  let startTimeStr = "09:00";
  let endTimeStr = "20:00";

  export let onCreateAvailability: (
    date: Date,
    startHour: number,
    endHour: number
  ) => void;
  export let onDeleteSlot: (slot: any) => void;

  let current = new Date(
    typeof initialDate === "string" ? new Date(initialDate) : initialDate
  );
  current = new Date(current.getFullYear(), current.getMonth(), 1);

  let selectedDate: Date | null = null;
  let selectedSlots: any[] = [];

  let startHour = 9;
  let endHour = 20;

  $: if (resetSelection) {
    selectedDate = null;
    selectedSlots = [];
  }

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  function toISODateString(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
      .toISOString()
      .slice(0, 10);
  }

  $: availableDates = new Set(
    schedule.map((s) => toISODateString(new Date(s.startTime)))
  );

  function buildCalendarDays(monthDate: Date) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startOffset = first.getDay();
    const days: { date: Date; inMonth: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--)
      days.push({ date: new Date(year, month, -i), inMonth: false });
    for (let d = 1; d <= last.getDate(); d++)
      days.push({ date: new Date(year, month, d), inMonth: true });
    while (days.length % 7 !== 0) {
      const nextIndex = days.length - startOffset + 1;
      days.push({
        date: new Date(year, month, last.getDate() + nextIndex),
        inMonth: false,
      });
    }
    return days;
  }

  $: days = buildCalendarDays(current);

  function prevMonth() {
    current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  }

  function nextMonth() {
    current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  }

  function isAvailable(date: Date) {
    return availableDates.has(toISODateString(date));
  }

  function selectDay(day: { date: Date; inMonth: boolean }) {
    if (!day.inMonth) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(day.date);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      alert("Não é possível registrar horários em datas passadas.");
      return;
    }

    selectedDate = day.date;
    selectedSlots = schedule.filter(
      (s) =>
        toISODateString(new Date(s.startTime)) === toISODateString(day.date)
    );
    startHour = 9;
    endHour = 20;
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function handleDelete(slot: any) {
    if (onDeleteSlot) onDeleteSlot(slot);
  }

  function handleCreate(date: Date, startHour: number, endHour: number) {
    const now = new Date();

    if (!selectedDate) return;

    const selectedDay = new Date(date);
    selectedDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDay.getTime() === today.getTime()) {
      if (startHour < now.getHours()) {
        alert("Não é possível registrar horário anterior ao atual.");
        return;
      }
    }

    if (onCreateAvailability) onCreateAvailability(date, startHour, endHour);
    startHour = 9;
    endHour = 20;
  }
</script>

<div class="bg-white rounded-lg shadow p-4">
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-2">
      <button
        type="button"
        on:click={prevMonth}
        class="p-2 rounded hover:bg-gray-100">‹</button
      >
      <div class="font-semibold text-lg capitalize">
        {current.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
      </div>
      <button
        type="button"
        on:click={nextMonth}
        class="p-2 rounded hover:bg-gray-100">›</button
      >
    </div>
    <div class="text-xs text-gray-500">
      Clique em um dia vazio para criar, clique em um slot para remover
    </div>
  </div>

  <div class="grid grid-cols-7 text-center text-xs text-gray-600 gap-1 mb-2">
    {#each weekdays as wd}<div class="py-1">{wd}</div>{/each}
  </div>

  <div class="grid grid-cols-7 gap-1">
    {#each days as day}
      <button
        type="button"
        on:click={() => selectDay(day)}
        class={`h-12 flex items-center justify-center rounded transition-colors text-sm
          ${day.inMonth ? "" : "text-gray-300"}
          ${isAvailable(day.date) && day.inMonth ? "bg-blue-100 hover:bg-blue-200 cursor-pointer" : "hover:bg-gray-100 cursor-pointer"}`}
      >
        <span>{day.date.getDate()}</span>
      </button>
    {/each}
  </div>

  {#if selectedSlots?.length > 0}
    <div class="mt-4">
      <h3 class="font-semibold mb-2">
        Horários registrados — {selectedDate?.toLocaleDateString()}
      </h3>
      <ul class="space-y-2 w-full md:w-56">
        {#each selectedSlots as slot}
          <li
            class="flex justify-between items-center p-2 border rounded bg-white shadow-sm"
          >
            <div class="font-medium">
              {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
            </div>
            <button
              class="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              on:click={() => handleDelete(slot)}>Excluir</button
            >
          </li>
        {/each}
      </ul>
    </div>
  {/if}
  {#if selectedDate}
    <div class="mt-4 p-2 border rounded shadow-sm bg-gray-50">
      <h3 class="font-semibold mb-2">
        Criar horário — {selectedDate.toLocaleDateString()}
      </h3>
      <div class="flex gap-2 items-center">
        <input
          type="time"
          bind:value={startTimeStr}
          class="border rounded px-2 py-1"
        />
        <input
          type="time"
          bind:value={endTimeStr}
          class="border rounded px-2 py-1"
        />
        <button
          class="bg-green-600 text-white px-3 py-1 rounded"
          on:click={() => {
            if (selectedDate) {
              const [startHour, startMinute] = startTimeStr
                .split(":")
                .map(Number);
              const [endHour, endMinute] = endTimeStr.split(":").map(Number);
              handleCreate(selectedDate, startHour, endHour);
            }
          }}
        >
          Adicionar
        </button>
      </div>
    </div>

    <script lang="ts">
      let startTimeStr = "09:00";
      let endTimeStr = "20:00";
    </script>
  {/if}
</div>
