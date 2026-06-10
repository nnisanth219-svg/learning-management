export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'student';
  studentId?: string;
  studentCode?: string;
};

const SESSION_KEY = 'eduvantage:user';

export function getSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user: SessionUser | null) {
  if (typeof window === 'undefined') return;
  if (!user) sessionStorage.removeItem(SESSION_KEY);
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
