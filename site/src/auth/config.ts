const devCognitoDomain = 'auth.dev.wanderertrip.com';
const devCognitoClientId = '264p3prtl7q631puc7pf86tjja';

export const cognitoDomain: string =
  import.meta.env.VITE_COGNITO_DOMAIN || devCognitoDomain;

export const clientId: string =
  import.meta.env.VITE_COGNITO_CLIENT_ID || devCognitoClientId;

export const apiBaseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;

export const getRedirectUri = (): string => {
  if (import.meta.env.VITE_REDIRECT_URI) {
    return import.meta.env.VITE_REDIRECT_URI;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/callback`;
  }

  return 'http://localhost:5173/callback';
};

export const scopes: string = ['email', 'openid', 'profile'].join(' ');

export interface CognitoEndpoints {
  authorize: string;
  token: string;
  logout: string;
  userInfo: string;
}

export const getCognitoEndpoints = (): CognitoEndpoints => {
  if (!cognitoDomain) {
    throw new Error('VITE_COGNITO_DOMAIN is not configured');
  }

  const baseUrl = `https://${cognitoDomain}`;
  return {
    authorize: `${baseUrl}/authorize`,
    token: `${baseUrl}/oauth2/token`,
    logout: `${baseUrl}/logout`,
    userInfo: `${baseUrl}/oauth2/userInfo`,
  };
};

