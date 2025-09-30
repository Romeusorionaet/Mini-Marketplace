<script lang="ts">
  import { goto } from "$app/navigation";
  import { Calendar } from "lucide-svelte";
  import { user } from "$lib/stores/auth";
  import { get } from "svelte/store";
  import { onMount } from "svelte";
  import { socket } from "$lib/services/socket";

  export let label: string = "Agenda";

  let hasNotification = false;

  function handleClick() {
    const currentUser = get(user);

    let path = "/";
    if (currentUser?.role === "CLIENT") {
      path = "/client/my-hirings";
    } else if (currentUser?.role === "PROVIDER") {
      path = "/provider-panel/hirings";
    }

    hasNotification = false;
    goto(path);
  }

  onMount(() => {
    socket.on("newBooking", (d) => {
      hasNotification = true;
    });

    socket.on("bookingCreated", (d) => {
      hasNotification = true;
    });

    return () => {
      socket.off("newBooking");
      socket.off("bookingCreated");
    };
  });
</script>

<button
  type="button"
  class="relative flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-full shadow"
  on:click={handleClick}
>
  <div class="relative">
    <Calendar class="w-5 h-5" />
    {#if hasNotification}
      <span
        class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"
      ></span>
    {/if}
  </div>
  <span>{label}</span>
</button>
