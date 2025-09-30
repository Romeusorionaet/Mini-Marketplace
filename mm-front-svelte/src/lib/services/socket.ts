import { io } from "socket.io-client";
import { get } from "svelte/store";
import { user } from "$lib/stores/auth";
import { hasNotification, highlightBookingId } from "$lib/stores/notifications";

export const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
});

socket.on("connect", () => {
  const currentUser = get(user);

  if (currentUser?.sub) {
    socket.emit("registerUser", currentUser.sub);
  }
});

socket.on("bookingCreated", (data: { bookingId: string }) => {
  hasNotification.set(true);
  highlightBookingId.set(data.bookingId);
});

socket.on("newBooking", (data: { bookingId: string }) => {
  hasNotification.set(true);
});
