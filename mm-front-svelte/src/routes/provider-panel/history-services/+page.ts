import { api } from "$lib/api";
import type { PageLoad } from "../$types";

export const load: PageLoad = async () => {
  let history: HistoryProviderType[] = [];
  let errorMessage = "";

  try {
    const res = await api.get("/booking/history/provider");
    history = res.data.historyBookings;
    history.sort(
      (a, b) =>
        new Date(b.bookings?.createdAt).getTime() -
        new Date(a.bookings?.createdAt).getTime()
    );
  } catch (err: any) {
    errorMessage = err.response?.data?.message || "Erro ao carregar histórico.";
  }

  return { history, errorMessage };
};
