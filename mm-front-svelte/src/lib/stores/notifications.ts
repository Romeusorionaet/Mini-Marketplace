import { writable } from "svelte/store";

export const hasNotification = writable(false);
export const highlightBookingId = writable<string | null>(null);
