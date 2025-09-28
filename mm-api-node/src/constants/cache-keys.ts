export const CACHE_KEYS = {
  SERVICE_TYPES: "service-types",
  BY_TYPE: (typeId: string) => `by-type:${typeId}`,
  SERVICE: (serviceId: string) => `service:${serviceId}`,
  SEARCH: (query: string) => `search:${query}`,
  SCHEDULE_PROVIDER: (providerId: string) => `schedule:provider:${providerId}`,
  HISTORY_PROVIDER: (providerId: string) => `history:provider:${providerId}`,
  BOOKINGS_CLIENT: (clientId: string) => `bookings:client:${clientId}`,
};
