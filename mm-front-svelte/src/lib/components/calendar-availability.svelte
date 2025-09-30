<script lang="ts">
  export let schedule: any[] = [];
  export let initialDate: Date | string = new Date();
  export let resetSelection: boolean = false;

  $: if (resetSelection) {
    selectedDate = null;
    selectedSlots = [];
  }

  export let onBook: (payload: { slot: any }) => void = () => {};

  let current = new Date(
    typeof initialDate === "string" ? new Date(initialDate) : initialDate
  );
  current = new Date(current.getFullYear(), current.getMonth(), 1);

  function toISODateString(d: Date) {
    const iso = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return iso.toISOString().slice(0, 10);
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

    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, inMonth: false });
    }

    for (let d = 1; d <= last.getDate(); d++) {
      days.push({ date: new Date(year, month, d), inMonth: true });
    }

    while (days.length % 7 !== 0) {
      const nextIndex = days.length - startOffset + 1;
      const d = new Date(year, month, last.getDate() + nextIndex);
      days.push({ date: d, inMonth: false });
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

  let selectedDate: Date | null = null;
  let selectedSlots: any[] = [];

  function isAvailable(date: Date) {
    return availableDates.has(toISODateString(date));
  }

  function selectDay(day: { date: Date; inMonth: boolean }) {
    if (!day.inMonth) return;
    const iso = toISODateString(day.date);
    if (!availableDates.has(iso)) {
      selectedDate = null;
      selectedSlots = [];
      return;
    }
    selectedDate = day.date;
    selectedSlots = schedule.filter(
      (s) => toISODateString(new Date(s.startTime)) === iso
    );
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function monthTitle(d: Date) {
    return d.toLocaleString("pt-BR", { month: "long", year: "numeric" });
  }

  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
</script>

<div class="bg-white rounded-lg shadow p-4">
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-2">
      <button
        type="button"
        on:click={prevMonth}
        class="p-2 rounded hover:bg-gray-100"
      >
        ‹
      </button>
      <div class="font-semibold text-lg capitalize">{monthTitle(current)}</div>
      <button
        type="button"
        on:click={nextMonth}
        class="p-2 rounded hover:bg-gray-100"
      >
        ›
      </button>
    </div>
    <div class="text-xs text-gray-500">Dias disponíveis estão destacados</div>
  </div>

  <div class="grid grid-cols-7 text-center text-xs text-gray-600 gap-1 mb-2">
    {#each weekdays as wd}
      <div class="py-1">{wd}</div>
    {/each}
  </div>

  <div class="grid grid-cols-7 gap-1">
    {#each days as day}
      <button
        type="button"
        on:click={() => selectDay(day)}
        class={`h-12 flex items-center justify-center rounded transition-colors text-sm
          ${day.inMonth ? "" : "text-gray-300"}
          ${isAvailable(day.date) && day.inMonth ? "bg-blue-100 hover:bg-blue-200 cursor-pointer" : ""}
          ${selectedDate && toISODateString(selectedDate) === toISODateString(day.date) ? "ring-2 ring-blue-400" : ""}
        `}
        aria-pressed={selectedDate &&
          toISODateString(selectedDate) === toISODateString(day.date)}
        disabled={!day.inMonth}
      >
        <span>{day.date.getDate()}</span>
      </button>
    {/each}
  </div>

  {#if selectedSlots?.length > 0}
    <div class="mt-4">
      <h3 class="font-semibold mb-2">
        Horários disponíveis — {selectedDate?.toLocaleDateString()}
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
              class="bg-blue-600 text-white px-3 cursor-pointer py-1 rounded"
              on:click={() => onBook({ slot })}
            >
              Reservar
            </button>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
