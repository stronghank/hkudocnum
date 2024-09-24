'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider basePath="/docnum/api/auth">{children}</SessionProvider>;
}
