import KeycloakProvider from "next-auth/providers/keycloak";
import { NextAuthOptions } from "next-auth";
import { Profile } from "next-auth";
import axios from 'axios';

const ALLOWED_ROLES = ['QA_Role_docnum_admin', 'QA_Role_HKUMedStaff'];
const ADMIN_ROLE = 'QA_Role_docnum_admin';

// Extend the Profile type
interface KeycloakProfile extends Profile {
  preferred_username?: string;
  sub?: string;
}

async function getAdminAccessToken() {
  const tokenUrl = `${process.env.NEXT_KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
  const params = new URLSearchParams();
  params.append('client_id', process.env.NEXT_KEYCLOAK_ID!);
  params.append('client_secret', process.env.NEXT_KEYCLOAK_SECRET!);
  params.append('grant_type', 'client_credentials');
  try {
    const response = await axios.post(tokenUrl, params);
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting admin access token:', error);
    return null;
  }
}

async function fetchAdditionalUserInfo(userUUID: string, adminAccessToken: string) {
  const userUrl = `${process.env.NEXT_KEYCLOAK_URL}/admin/realms/${process.env.NEXT_KEYCLOAK_REALM}/users/${userUUID}`;
  try {
    const userResponse = await axios.get(userUrl, {
      headers: { 'Authorization': `Bearer ${adminAccessToken}` }
    });
    return userResponse.data;
  } catch (error) {
    console.error('Error fetching additional user info:', error);
    return null;
  }
}

async function fetchUserRoles(userUUID: string, adminAccessToken: string) {
  const rolesUrl = `${process.env.NEXT_KEYCLOAK_URL}/admin/realms/${process.env.NEXT_KEYCLOAK_REALM}/users/${userUUID}/role-mappings`;
  try {
    const rolesResponse = await axios.get(rolesUrl, {
      headers: { 'Authorization': `Bearer ${adminAccessToken}` }
    });
    return rolesResponse.data;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_KEYCLOAK_ID!,
      clientSecret: process.env.NEXT_KEYCLOAK_SECRET!,
      issuer: process.env.NEXT_KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const keycloakProfile = profile as KeycloakProfile;
        token.uid = keycloakProfile.preferred_username || '';

        console.log("Keycloak Profile:", keycloakProfile);

        if (keycloakProfile.sub) {
          const adminAccessToken = await getAdminAccessToken();
          if (adminAccessToken) {
            const userData = await fetchAdditionalUserInfo(keycloakProfile.sub, adminAccessToken);
            if (userData) {
              console.log("User Data:", userData);
              token.hkuno = userData.attributes?.HKUno?.[0];
              token.name = userData.attributes?.Name?.[0] || keycloakProfile.name;
            }

            const userRoles = await fetchUserRoles(keycloakProfile.sub, adminAccessToken);
            if (userRoles) {
              console.log("User Roles:", userRoles);
              token.roles = userRoles.realmMappings?.map((role: any) => role.name) || [];

              // Check if user has at least one allowed role
              const hasAllowedRole = token.roles.some(role => ALLOWED_ROLES.includes(role));
              if (!hasAllowedRole) {
                throw new Error("You do not have permission to access this system.");
              }

              // Set isAdmin flag
              token.isAdmin = token.roles.includes(ADMIN_ROLE);

            }
          } else {
            console.error("Failed to obtain admin access token");
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.uid = token.uid as string;
        session.user.hkuno = token.hkuno as string;
        session.user.name = token.name as string;
        session.user.roles = token.roles as string[];
        session.user.isAdmin = token.isAdmin as boolean; 
      }
      console.log("Options.ts return session: ", session);
      return session;
    },
  },
  pages: {
    error: '/auth/error',
  },
};