<script lang="ts">
	let nome = "";
	let email = "";
	let password = "";
	let userType = "CLIENT"; // CLIENT ou PROVIDER

	let loading = false;
	let messageError = "";

	async function handleRegister() {
		loading = true;
		messageError = "";

		try {
			const apiUrl = import.meta.env.VITE_API_URL;
			
			const res = await fetch(`${apiUrl}/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: nome,
					email,
					password: password,
					role: userType
				})
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || "Erro no cadastro");
			}

			const data = await res.json();
			alert(data.message);
			// redirecionar para login
			window.location.href = "/auth/sign-in";

		} catch (err: any) {
			messageError = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-md mx-auto mt-10 p-6 rounded-lg shadow bg-white">
	<h1 class="text-2xl font-bold text-center mb-6">Cadastro</h1>

	<form on:submit|preventDefault={handleRegister} class="space-y-4">
		<div>
			<label class="block text-sm font-medium">Nome</label>
			<input type="text" bind:value={nome} required class="w-full border rounded p-2" />
		</div>

		<div>
			<label class="block text-sm font-medium">Email</label>
			<input type="email" bind:value={email} required class="w-full border rounded p-2" />
		</div>

		<div>
			<label class="block text-sm font-medium">Senha</label>
			<input type="password" bind:value={password} required class="w-full border rounded p-2" />
		</div>

		<div>
			<label class="block text-sm font-medium">Tipo de usuário</label>
			<select bind:value={userType} class="w-full border rounded p-2">
				<option value="CLIENT">Cliente</option>
				<option value="PROVIDER">Prestador de Serviço</option>
			</select>
		</div>

		<button type="submit" class="w-full bg-blue-600 text-white rounded p-2 font-semibold" disabled={loading}>
			{loading ? "Cadastrando..." : "Cadastrar"}
		</button>

		{#if messageError}
			<p class="text-red-500 text-sm mt-2">{messageError}</p>
		{/if}
	</form>
</div>
