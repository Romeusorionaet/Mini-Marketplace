<script>
	// Aqui por enquanto é estático, depois você pode puxar da API
	const categorias = [
		{ id: 1, nome: "Beleza", descricao: "Serviços de manicure, cabelo, maquiagem" },
		{ id: 2, nome: "Reformas", descricao: "Pedreiro, eletricista, encanador" },
		{ id: 3, nome: "Tecnologia", descricao: "Suporte de TI, criação de sites" }
	];
</script>

<h1>Mini Marketplace</h1>
<p>Encontre prestadores de serviços perto de você</p>

<ul>
	{#each categorias as categoria}
		<li>
			<strong>{categoria.nome}</strong>
			<p>{categoria.descricao}</p>
		</li>
	{/each}
</ul>

<div>
	<a href="/auth/sign-in">Login</a>
	<a href="/auth/sign-up">Criar conta</a>
</div>
