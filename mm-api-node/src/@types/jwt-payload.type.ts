type JwtPayloadType = {
  sub: string;
  name: string;
  email: string;
  role: "PROVIDER" | "CLIENT";
  permissions?: string;
  iat?: number;
  exp?: number;
};
