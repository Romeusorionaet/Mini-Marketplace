type SignUpBodyType = {
  name: string;
  email: string;
  password: string;
  role: "CLIENT" | "PROVIDER";
  city: string;
};
