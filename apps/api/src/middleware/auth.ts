import { fromNodeHeaders } from "better-auth/node";
import { Request, Response, NextFunction } from "express";
// import { Role } from "@repo/types";
import { auth } from "src/lib/auth";

export interface AuthRequest extends Request {
  user?: any;
}

export enum Role {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  USER = "user",
}

// Authentication middleware
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
   	const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }


    req.user = session.user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid session" });
    return;
  }
};

// Role-based middleware
export const requireRole = (role: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        error: "Forbidden",
        message: `Required role: ${role}`,
      });
      return;
    }

    next();
  };
};

// Multiple roles middleware
export const requireAnyRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden",
        message: `Required one of roles: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(Role.ADMIN);
export const requireSuperAdmin = requireRole(Role.SUPER_ADMIN);
