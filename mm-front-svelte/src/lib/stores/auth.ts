import { writable } from "svelte/store";

export const isLoggedIn = writable(false);

export const user = writable<{
  sub: string;
  email: string;
  role: string;
} | null>(null);
