<script>
	let email = "";
	let senha = "";

	function handleLogin() {
		// Aqui você vai chamar a API depois
		alert(`Tentando login com ${email}`);
	}
</script>

<h1>Login</h1>

<form on:submit|preventDefault={handleLogin}>
	<label>
		Email:
		<input type="email" bind:value={email} required />
	</label>

	<label>
		Senha:
		<input type="password" bind:value={senha} required />
	</label>

	<button type="submit">Entrar</button>
</form>
