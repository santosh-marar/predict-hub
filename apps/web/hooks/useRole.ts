"use client";

import { useSession } from "@/lib/auth-client";
import { Role } from "@repo/types";


export const useRole = () => {
     const {
       data: session,
       isPending, 
       error, 
       refetch,
     } = useSession();
  const user = session?.user;

  return {
    user,
    role: user?.role,
    isAdmin: () => user?.role === Role.ADMIN,
    isSuperAdmin: () => user?.role === Role.SUPER_ADMIN,
    isUser: () => user?.role === Role.USER,
    hasRole: (role: Role) => user?.role === role,
    hasAnyRole: (roles: Role[]) => roles.includes(user?.role),
    canAccess: (allowedRoles: Role[]) => allowedRoles.includes(user?.role),
  };
};
