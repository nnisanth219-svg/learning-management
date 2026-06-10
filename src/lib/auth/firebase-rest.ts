import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GoogleAuth } from 'google-auth-library';
import { mapFirebaseAuthError } from '@/lib/auth/errors';

type SignInResponse = { idToken: string; localId: string; email?: string };
type ServiceAccountKey = { project_id: string; private_key: string; client_email: string };

let googleAuth: GoogleAuth | undefined;
let projectId: string | undefined;

function loadCredentials(): ServiceAccountKey {
  const rel = process.env.FIREBASE_CREDENTIALS?.trim();
  if (!rel) throw new Error('FIREBASE_CREDENTIALS is not set.');
  return JSON.parse(readFileSync(resolve(process.cwd(), rel), 'utf8')) as ServiceAccountKey;
}

async function identityToolkitRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  if (!googleAuth) {
    const key = loadCredentials();
    projectId = key.project_id;
    googleAuth = new GoogleAuth({ credentials: key, scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  }
  const client = await googleAuth.getClient();
  const token = await client.getAccessToken();
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.token}`,
      'X-Goog-User-Project': projectId!,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(mapFirebaseAuthError(json.error?.message ?? 'AUTH_REQUEST_FAILED'));
  return json;
}

export async function signInWithEmailPassword(email: string, password: string): Promise<SignInResponse> {
  const body = await identityToolkitRequest<SignInResponse>('accounts:signInWithPassword', {
    email,
    password,
    returnSecureToken: true,
  });
  if (!body.idToken) throw new Error('Sign-in succeeded but no token was returned.');
  return body;
}

export async function signUpWithEmailPassword(email: string, password: string, displayName?: string) {
  const body = await identityToolkitRequest<SignInResponse>('accounts:signUp', {
    email,
    password,
    returnSecureToken: true,
  });
  if (displayName && body.localId) {
    const { getAdminAuth } = await import('@/lib/firebase/admin');
    await getAdminAuth().updateUser(body.localId, { displayName });
  }
  if (body.idToken) return body;
  return signInWithEmailPassword(email, password);
}

export async function sendPasswordResetEmail(email: string) {
  await identityToolkitRequest('accounts:sendOobCode', {
    email,
    requestType: 'PASSWORD_RESET',
  });
}
