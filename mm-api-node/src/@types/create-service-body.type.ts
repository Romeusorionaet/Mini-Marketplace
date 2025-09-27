type CreateServiceBodyType = {
  providerId: string;
  typeId: string;
  name: string;
  description: string;
  photos: string[];
  variations: {
    name: string;
    priceCents: string;
    durationMinutes: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
};
