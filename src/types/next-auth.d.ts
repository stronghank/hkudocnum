import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      uid: string;
      hkuno?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      account_type?: string;
      roles: string[];
      isAdmin?: boolean;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    uid: string;
    hkuno?: string;
    accessToken?: string;
    account_type?: string;
    roles: string[];
    isAdmin?: boolean;
  }
}