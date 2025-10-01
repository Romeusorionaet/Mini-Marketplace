<script lang="ts">
  import { onMount } from "svelte";
  import { api } from "$lib/api";
  import { get } from "svelte/store";
  import { user } from "$lib/stores/auth";
  import ProviderCalendarAvailability from "$lib/components/provider-calendar-availability.svelte";

  let schedule: any[] = [];
  let resetCalendar = false;

  const currentUser = get(user);

  onMount(async () => {
    await fetchProviderSchedule();
  });

  async function fetchProviderSchedule() {
    if (!currentUser?.providerId) return;
    try {
      const res = await api.get(
        `/schedule/availability/list/provider?providerId=${currentUser.providerId}`
      );
      schedule = [...res.data.availableSchedule];
    } catch (err: any) {
      console.error(err.response?.data?.message || "Erro ao carregar agenda");
    }
  }

  async function handleDelete(slot: any) {
    if (!confirm("Deseja realmente excluir este horário?")) return;

    try {
      const res = await api.delete(
        `/schedule/availability/delete?availabilityId=${slot.id}`
      );
      alert(res?.data?.message);
      await fetchProviderSchedule();
      resetCalendar = true;
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao excluir horário.");
    } finally {
      resetCalendar = false;
    }
  }

  async function createAvailability(date: Date, startHour = 9, endHour = 20) {
    if (!currentUser?.providerId) return;

    const startTime = new Date(date);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(endHour, 0, 0, 0);

    try {
      await api.post("/schedule/availability/create", {
        providerId: currentUser.providerId,
        startTime,
        endTime,
      });
      alert("Horário criado com sucesso!");
      await fetchProviderSchedule();
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao criar horário.");
    }
  }
</script>

<main>
  <ProviderCalendarAvailability
    {schedule}
    resetSelection={resetCalendar}
    onCreateAvailability={createAvailability}
    onDeleteSlot={handleDelete}
  />
</main>
