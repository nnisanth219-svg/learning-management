import { DEMO_USER } from '@/lib/demo/credentials';
import { getPlatformSettings } from '@/lib/firestore/platform';
import { getAdminAuth } from '@/lib/firebase/admin';

export const SUPER_ADMIN_EMAIL = DEMO_USER.email.toLowerCase();

let cachedWorkspaceOwnerId: string | null | undefined;

export async function resolveWorkspaceOwnerId(): Promise<string | null> {
  if (cachedWorkspaceOwnerId !== undefined) return cachedWorkspaceOwnerId;
  try {
    const platform = await getPlatformSettings();
    if (platform?.ownerId) {
      cachedWorkspaceOwnerId = platform.ownerId;
      return platform.ownerId;
    }
    cachedWorkspaceOwnerId = (await getAdminAuth().getUserByEmail(SUPER_ADMIN_EMAIL)).uid;
    return cachedWorkspaceOwnerId;
  } catch {
    cachedWorkspaceOwnerId = null;
    return null;
  }
}

export function clearWorkspaceOwnerCache() {
  cachedWorkspaceOwnerId = undefined;
}
