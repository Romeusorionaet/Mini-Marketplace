<script lang="ts">
  import { onMount } from "svelte";
  import { isLoggedIn, user } from "../stores/auth";
  import { api } from "$lib/api";
  import { goto } from "$app/navigation";

  onMount(async () => {
    try {
      const res = await api.get("/auth/me");

      if (res.data.loggedIn) {
        isLoggedIn.set(true);
        user.set({ email: res.data.email, role: res.data.role });
      } else {
        isLoggedIn.set(false);
        user.set(null);
      }
    } catch (err) {
      isLoggedIn.set(false);
      user.set(null);
    }
  });

  async function logout() {
    await api.post("/auth/logout").finally(() => {
      isLoggedIn.set(false);
      user.set(null);
    });

    goto("/");
  }
</script>

<header class="flex max-md:flex-col gap-4 justify-between items-center mb-6">
  <div>
    <h1 class="text-xl md:text-2xl inline-block font-bold">Mini Marketplace</h1>
    {#if $isLoggedIn && $user}
      <p class="text-sm text-gray-600">{$user.email} ({$user.role})</p>
    {/if}
  </div>
  <nav>
    <ul class="space-x-4 flex items-center">
      <li>
        <a href="/" class="md:font-semibold hover:underline">Home</a>
      </li>

      {#if $isLoggedIn}
        <li>
          <button
            on:click={logout}
            class="text-red-600 md:font-semibold hover:underline">Sair</button
          >
        </li>
      {:else}
        <li>
          <a
            href="/auth/sign-in"
            class="text-blue-600 md:font-semibold hover:underline">Login</a
          >
        </li>
        <li>
          <a
            href="/auth/sign-up"
            class="bg-blue-500 text-white md:px-4 px-2 py-1 md:py-2 hover:bg-blue-600 rounded-lg"
            >Criar conta</a
          >
        </li>
      {/if}
    </ul>
  </nav>
</header>
