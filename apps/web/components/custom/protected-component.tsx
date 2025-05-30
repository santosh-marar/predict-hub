"use client";

import { ReactNode } from "react";
import { useRole } from "@/hooks/useRole";
import { Role } from "@repo/types";

interface ProtectedComponentProps {
  children: ReactNode;
  role?: Role;
  roles?: Role[];
  fallback?: ReactNode;
  adminOnly?: boolean;
}

export const ProtectedComponent = ({
  children,
  role,
  roles,
  fallback = null,
  adminOnly = false,
}: ProtectedComponentProps) => {
  const { user, hasRole, hasAnyRole, isAdmin } = useRole();

  // If user is not logged in
  if (!user) {
    return <>{fallback}</>;
  }

  // Admin only check
  if (adminOnly && !isAdmin()) {
    return <>{fallback}</>;
  }

  // Single role check
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Multiple roles check
  if (roles && !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
