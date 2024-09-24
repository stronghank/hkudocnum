import axios from 'axios';

export async function fetchUserInfo(accessToken: string) {
  const keyCloakAuthUri = `${process.env.NEXT_KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`;
  console.log("Keycloak UserInfo URI:", keyCloakAuthUri);

  try {
    const response = await axios.get(keyCloakAuthUri, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    console.log("Keycloak userinfo response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}