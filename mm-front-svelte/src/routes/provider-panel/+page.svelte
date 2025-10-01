<script>
  let estatisticas = [
    { nome: "Serviços", valor: 12 },
    { nome: "Contratações", valor: 34 },
    { nome: "Disponibilidades", valor: 8 },
  ];

  let servicos = [
    { id: 1, nome: "Manicure", descricao: "Serviço de manicure excelente" },
    {
      id: 2,
      nome: "Pintura de unhas",
      descricao: "Pintura de unhas artística",
    },
    { id: 3, nome: "Cabelo", descricao: "Corte e escova profissional" },
  ];
</script>

<div class="flex bg-gray-100">
  <main class="flex-1 p-4">
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {#each estatisticas as stat}
        <div class="bg-white shadow p-4 rounded">
          <p class="text-sm text-gray-500">{stat.nome}</p>
          <p class="text-xl font-bold">{stat.valor}</p>
        </div>
      {/each}
    </div>

    <div class="bg-white shadow rounded p-4">
      <h2 class="text-lg font-semibold mb-4">Meus Serviços</h2>
      <table class="w-full text-left">
        <thead>
          <tr class="border-b">
            <th class="py-2">Nome</th>
            <th class="py-2">Descrição</th>
            <th class="py-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {#each servicos as servico}
            <tr class="border-b hover:bg-gray-50">
              <td class="py-2">{servico.nome}</td>
              <td class="py-2">{servico.descricao}</td>
              <td class="py-2">
                <button class="text-blue-500 hover:underline mr-2"
                  >Editar</button
                >
                <button class="text-red-500 hover:underline">Excluir</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </main>
</div>
