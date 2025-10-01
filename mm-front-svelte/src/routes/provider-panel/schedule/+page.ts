import { api } from "$lib/api";
import { get } from "svelte/store";
import { user } from "$lib/stores/auth";

export async function load() {
  const currentUser = get(user);

  if (!currentUser?.providerId) {
    return { schedule: [] };
  }

  try {
    const res = await api.get(
      `/schedule/availability/list/provider?providerId=${currentUser.providerId}`
    );
    return { schedule: res.data.availableSchedule };
  } catch (err: any) {
    return { schedule: [] };
  }
}
