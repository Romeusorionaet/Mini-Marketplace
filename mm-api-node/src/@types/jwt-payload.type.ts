type JwtPayloadType = {
  sub: string;
  name: string;
  email: string;
  role: "PROVIDER" | "CLIENT";
  providerId: string;
  permissions?: string;
  iat?: number;
  exp?: number;
};
