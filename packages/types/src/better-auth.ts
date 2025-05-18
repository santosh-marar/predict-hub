// packages/shared/types.ts
import type { createAuthClient } from "better-auth/client";
import { auth } from "../../../apps/api/src/lib/auth";

export type AuthClient = ReturnType<typeof createAuthClient<typeof auth>>;
