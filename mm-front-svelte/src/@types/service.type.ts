export type ServiceType = {
  variations: ServiceVariationType[];
  id: string;
  providerId: string;
  typeId: string;
  name: string;
  description: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
};
