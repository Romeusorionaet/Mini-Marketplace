type UserType = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "PROVIDER" | "CLIENT";
  city: string;
  createdAt: Date;
  updatedAt: Date;
};
