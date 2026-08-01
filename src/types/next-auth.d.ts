import type { Role } from "@/generated/prisma/client";
import type { DefaultSession } from "@auth/core/types";

// `next-auth` re-exports its Session/JWT types from `@auth/core` rather than
// declaring them locally, so augmenting "next-auth" / "next-auth/jwt" directly
// does not merge into the real interfaces. Augmenting "@auth/core/types" and
// "@auth/core/jwt" is what actually takes effect.
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
