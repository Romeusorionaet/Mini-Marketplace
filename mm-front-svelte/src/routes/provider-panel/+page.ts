import type { PageLoad } from "./$types";
import { api } from "$lib/api";
import type { ServiceType } from "../../@types/service.type";

export const load: PageLoad = async () => {
  let services: ServiceType[] = [];
  let errorMessage: string | null = null;
  let serviceTypes: { id: string; name: string }[] = [];

  try {
    const res = await api.get("/service/provider");
    services = Array.isArray(res.data) ? res.data : [];
  } catch (err: any) {
    if (err.response?.status === 404) {
      services = [];
    } else {
      errorMessage =
        err.response?.data?.message || "Erro ao carregar serviços.";
    }
  }

  try {
    const res = await api.get("/service/list-types");
    serviceTypes = res.data.servicesType;
  } catch (err) {
    console.error(err);
  }

  return { services, errorMessage, serviceTypes };
};
