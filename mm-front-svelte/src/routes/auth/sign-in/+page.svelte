<script lang="ts">
  import { api } from "$lib/api";

  let email = "";
  let password = "";
  let loading = false;
  let messageError = "";

  async function handleLogin() {
    loading = true;
    messageError = "";

    try {
      await api.post("/auth/sign-in", {
        email,
        password,
      });

      window.location.href = "/";
    } catch (err: any) {
      messageError = err.response.data.message;
    } finally {
      loading = false;
    }
  }
</script>

<main class="max-w-md mx-auto mt-10 p-6 rounded-lg shadow bg-white">
  <h1 class="text-2xl font-bold text-center mb-6">Login</h1>

  <form on:submit|preventDefault={handleLogin} class="space-y-4">
    <div>
      <label class="block text-sm font-medium"
        >Email
        <input
          type="email"
          bind:value={email}
          required
          class="w-full border rounded p-2"
        />
      </label>
    </div>

    <div>
      <label class="block text-sm font-medium"
        >Senha

        <input
          type="password"
          bind:value={password}
          required
          class="w-full border rounded p-2"
        />
      </label>
    </div>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white rounded p-2 font-semibold"
      disabled={loading}
    >
      {loading ? "Entrando..." : "Entrar"}
    </button>

    {#if messageError}
      <p class="text-red-500 text-sm mt-2">{messageError}</p>
    {/if}

    <p class="text-sm text-center mt-4">
      Não tem conta?
      <a href="/auth/sign-up" class="text-blue-600 font-semibold">Cadastre-se</a
      >
    </p>
  </form>
</main>
