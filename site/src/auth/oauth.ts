import {
  clientId,
  cognitoDomain,
  getCognitoEndpoints,
  getRedirectUri,
  scopes,
} from './config';

const CODE_VERIFIER_KEY = 'oauth_code_verifier';
const STATE_KEY = 'oauth_state';
const REDIRECT_PATH_KEY = 'oauth_redirect_path';
const REDIRECT_URI_KEY = 'oauth_redirect_uri';

export interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

export async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

function base64URLEncode(array: Uint8Array): string {
  const charCodes = Array.from(array);
  return btoa(String.fromCharCode(...charCodes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

export async function getAuthUrl(
  redirectPath: string | null = null
): Promise<string> {
  const verifier = await generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  if (redirectPath) {
    sessionStorage.setItem(REDIRECT_PATH_KEY, redirectPath);
  }

  const endpoints = getCognitoEndpoints();
  const redirectUri = getRedirectUri();
  sessionStorage.setItem(REDIRECT_URI_KEY, redirectUri);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: scopes,
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  });

  console.log('OAuth configuration:', {
    cognitoDomain,
    clientId,
    redirectUri,
    scopes,
  });

  return `${endpoints.authorize}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  state: string
): Promise<TokenResponse> {
  const storedState = sessionStorage.getItem(STATE_KEY);
  if (!storedState || storedState !== state) {
    throw new Error('Invalid state parameter.');
  }

  const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
  if (!verifier) {
    throw new Error('Code verifier not found. Please initiate login again.');
  }

  const storedRedirectUri = sessionStorage.getItem(REDIRECT_URI_KEY);
  const fallbackRedirectUri = getRedirectUri();
  const redirectUri = storedRedirectUri || fallbackRedirectUri;

  const endpoints = getCognitoEndpoints();
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const response = await fetch(endpoints.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Token exchange failed: ${response.status}`);
  }

  const tokens = (await response.json()) as TokenResponse;

  sessionStorage.removeItem(CODE_VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(REDIRECT_URI_KEY);

  return tokens;
}

export function getAndClearRedirectPath(): string | null {
  const path = sessionStorage.getItem(REDIRECT_PATH_KEY);
  if (path) {
    sessionStorage.removeItem(REDIRECT_PATH_KEY);
  }
  return path;
}

