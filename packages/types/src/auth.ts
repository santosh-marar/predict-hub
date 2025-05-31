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

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  banned?: boolean | null;
  role?: string | null;
  banReason?: string | null;
  banExpires?: Date | null;
}

