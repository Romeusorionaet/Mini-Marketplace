<script lang="ts">
  import { api } from "$lib/api";
  import { formatDuration } from "$lib/utils/format-duration";
  import { uploadFiles } from "$lib/utils/upload-files";
  import type { ServiceType } from "../../@types/service.type";

  export let data: {
    services: ServiceType[];
    errorMessage: string | null;
    serviceTypes: { id: string; name: string }[];
  };

  let services: ServiceType[] = [...data.services];
  let deletingId: string | null = null;
  let selectedTypeId: string = "";
  let name = "";
  let description = "";
  let variations: {
    name: string;
    priceCents: number;
    durationMinutes: number;
  }[] = [{ name: "", priceCents: 0, durationMinutes: 0 }];
  let photos: File[] = [];

  let creating = false;
  let createError: string | null = null;

  async function deleteService(serviceId: string) {
    if (!confirm("Deseja realmente excluir este serviço?")) return;

    deletingId = serviceId;
    try {
      await api.delete(`/service/delete?serviceId=${serviceId}`);
      services = services.filter((s) => s.id !== serviceId);
    } catch (err: any) {
      alert(err.message || "Erro ao excluir o serviço.");
    } finally {
      deletingId = null;
    }
  }

  function addVariation() {
    const hasEmpty = variations.some(
      (v) => !v.name || v.priceCents <= 0 || v.durationMinutes <= 0
    );

    if (hasEmpty) return;

    variations = [
      ...variations,
      { name: "", priceCents: 0, durationMinutes: 0 },
    ];
  }

  async function createService() {
    const validVariations = variations.filter(
      (v) => v.name && v.priceCents > 0 && v.durationMinutes > 0
    );

    if (
      !selectedTypeId ||
      !name ||
      !description ||
      validVariations.length === 0
    ) {
      createError =
        "Selecione o tipo, preencha todos os campos e adicione pelo menos uma variação.";
      return;
    }

    creating = true;
    createError = null;

    try {
      const photosUrls = await uploadFiles(photos);

      const payload = {
        typeId: selectedTypeId,
        name,
        description,
        variations: validVariations.map((v) => ({
          name: v.name,
          priceCents: Math.round(v.priceCents * 100),
          durationMinutes: v.durationMinutes,
        })),
        photos: photosUrls,
      };

      await api.post("/service/create", payload);

      name = "";
      description = "";
      variations = [{ name: "", priceCents: 0, durationMinutes: 0 }];
      photos = [];
      window.location.reload();
    } catch (err: any) {
      createError = "Erro ao criar serviço.";
    } finally {
      creating = false;
    }
  }

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) photos = Array.from(input.files);
  }
</script>

<div class="flex bg-gray-100">
  <main class="flex-1">
    <h1 class="text-2xl font-bold mb-6">Serviços</h1>

    <section class="bg-white shadow rounded p-4 mb-6">
      <h2 class="text-lg font-semibold mb-4">Criar Serviço</h2>

      {#if createError}
        <p class="text-red-500">{createError}</p>
      {/if}

      <div class="space-y-2">
        <select bind:value={selectedTypeId} class="border p-2 w-full">
          <option value="" disabled selected>Selecione o tipo de serviço</option
          >
          {#each data.serviceTypes as st}
            <option value={st.id}>{st.name}</option>
          {/each}
        </select>

        <input
          type="text"
          placeholder="Nome do serviço"
          bind:value={name}
          class="border p-2 w-full"
        />
        <textarea
          placeholder="Descrição"
          bind:value={description}
          class="border p-2 w-full"
        ></textarea>

        <h3 class="font-semibold mt-2">Opções do serviço</h3>
        <p class="text-sm text-gray-600 mb-2">
          Adicione diferentes opções para o serviço, como preços e durações
          variadas.
        </p>

        {#each variations as v, i}
          <div class="flex max-md:flex-col gap-1">
            <label class="block text-sm text-gray-700">
              Nome da opção
              <input
                type="text"
                placeholder="Ex: Corte masculino, Corte feminino..."
                bind:value={v.name}
                class="border p-2 w-full rounded"
              />
            </label>

            <div class="flex flex-col justify-center gap-1 items-end">
              <label class="block text-sm text-gray-700">
                Preço
                <input
                  type="number"
                  placeholder="Em centavos (ex: 5000 = R$ 50)"
                  bind:value={v.priceCents}
                  class="border p-2 w-32 rounded"
                />
              </label>

              <label class="block text-sm text-gray-700">
                Duração (minutos)
                <input
                  type="number"
                  placeholder="Tempo em minutos (ex: 60)"
                  bind:value={v.durationMinutes}
                  class="border p-2 w-32 rounded"
                />
              </label>
            </div>
          </div>
        {/each}

        <button
          on:click={addVariation}
          class="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
        >
          Adicionar opção
        </button>

        <input
          type="file"
          multiple
          accept="image/*"
          on:change={handleFileChange}
          class="border p-2 w-full cursor-pointer"
        />

        <button
          on:click={createService}
          class="bg-green-500 text-white px-4 py-2 rounded mt-2 cursor-pointer"
          disabled={creating}
        >
          {creating ? "Criando..." : "Criar Serviço"}
        </button>
      </div>
    </section>

    <section class="bg-white shadow rounded p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Meus Serviços</h2>
        <span>{services.length}</span>
        <!-- aqui usamos services local -->
      </div>

      {#if data.errorMessage}
        <p class="text-red-500">{data.errorMessage}</p>
      {:else if services.length === 0}
        <p class="text-gray-600">Nenhum serviço cadastrado.</p>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="hidden xl:table-header-group">
              <tr class="border-b">
                <th class="py-2">Nome</th>
                <th class="py-2">Descrição</th>
                <th class="py-2">Variações</th>
              </tr>
            </thead>
            <tbody>
              {#each services as s}
                <!-- aqui usamos services local -->
                <tr
                  class="xl:table-row grid grid-cols-1 border-b p-2 md:p-0 md:border-0"
                >
                  <td
                    class="py-2 md:table-cell before:content-['Nome:'] md:before:content-none before:font-semibold before:mr-2 flex items-center justify-between"
                  >
                    <span>{s.name}</span>
                    <button
                      class="text-red-500 bg-zinc-100 p-1 rounded-md hover:bg-zinc-200 ml-2"
                      on:click={() => deleteService(s.id)}
                      disabled={deletingId === s.id}
                    >
                      {deletingId === s.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </td>

                  <td
                    class="py-2 md:table-cell before:content-['Descrição:'] md:before:content-none before:font-semibold before:mr-2"
                  >
                    {s.description}
                  </td>

                  <td
                    class="py-2 md:table-cell before:content-['Variações:'] md:before:content-none before:font-semibold before:mr-2"
                  >
                    <ul class="list-disc ml-4 space-y-1">
                      {#each s.variations as v}
                        <li class="flex justify-between items-center">
                          <span
                            >{v.name} — R$ {(v.priceCents / 100).toFixed(2)} | {formatDuration(
                              v.durationMinutes
                            )}</span
                          >
                        </li>
                      {/each}
                    </ul>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  </main>
</div>
