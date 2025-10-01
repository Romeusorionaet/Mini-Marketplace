<script lang="ts">
  import { page } from "$app/state";

  type NavItem = {
    label: string;
    path: string;
  };

  const navItems: NavItem[] = [
    { label: "Serviços", path: "/provider-panel" },
    { label: "Histórico", path: "/provider-panel/history-services" },
    { label: "Agenda", path: "/provider-panel/schedule" },
    { label: "Contratações", path: "/provider-panel/hirings" },
  ];
</script>

<div class="flex bg-gray-100">
  <aside class="w-64 bg-white shadow-md p-6 flex flex-col">
    <h2 class="text-xl font-bold mb-6">Painel administrativo</h2>
    <nav class="flex flex-col gap-3">
      {#each navItems as item}
        <a
          href={item.path}
          class={`hover:bg-gray-200 p-2 rounded ${
            page.url.pathname === item.path ? "bg-gray-300 font-bold" : ""
          }`}
        >
          {item.label}
        </a>
      {/each}
    </nav>
  </aside>

  <main class="flex-1 h-screen p-2 overflow-auto">
    <slot />
  </main>
</div>
