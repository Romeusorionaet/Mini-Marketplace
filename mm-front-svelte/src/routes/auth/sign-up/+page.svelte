<script lang="ts">
  import { api } from "$lib/api";
  import { goto } from "$app/navigation";

  let nome = "";
  let email = "";
  let password = "";
  let userType = "CLIENT";
  let city = "";

  let loading = false;
  let messageError = "";

  async function handleRegister() {
    loading = true;
    messageError = "";

    try {
      const res = await api.post("/auth/sign-up", {
        name: nome,
        email,
        password: password,
        role: userType,
        city,
      });

      alert(res.data.message);
      goto("/auth/sign-in");
    } catch (err: any) {
      messageError = err.response.data.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-md mx-auto mt-10 p-6 rounded-lg shadow bg-white">
  <h1 class="text-2xl font-bold text-center mb-6">Cadastro</h1>

  <form on:submit|preventDefault={handleRegister} class="space-y-4">
    <label class="block text-sm font-medium"
      >Nome
      <input
        type="text"
        bind:value={nome}
        required
        class="w-full border rounded p-2"
      />
    </label>

    <label class="block text-sm font-medium"
      >Email
      <input
        type="email"
        bind:value={email}
        required
        class="w-full border rounded p-2"
      />
    </label>

    <label class="block text-sm font-medium"
      >Cidade
      <input
        type="city"
        bind:value={city}
        required
        class="w-full border rounded p-2"
      />
    </label>

    <label class="block text-sm font-medium"
      >Senha
      <input
        type="password"
        bind:value={password}
        required
        class="w-full border rounded p-2"
      />
    </label>

    <label class="block text-sm font-medium"
      >Tipo de usuário
      <select bind:value={userType} class="w-full border rounded p-2">
        <option value="CLIENT">Cliente</option>
        <option value="PROVIDER">Prestador de Serviço</option>
      </select>
    </label>

    <button
      type="submit"
      class="w-full bg-blue-600 text-white rounded p-2 font-semibold"
      disabled={loading}
    >
      {loading ? "Cadastrando..." : "Cadastrar"}
    </button>

    {#if messageError}
      <p class="text-red-500 text-sm mt-2">{messageError}</p>
    {/if}
  </form>
</div>
