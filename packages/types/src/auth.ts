export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export enum Role {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
}
