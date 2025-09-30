import { writable } from "svelte/store";

export const isLoggedIn = writable(false);

export const user = writable<{ email: string; role: string } | null>(null);
