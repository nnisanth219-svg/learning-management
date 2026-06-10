const FIREBASE_MESSAGES: Record<string, string> = {
  EMAIL_EXISTS: 'An account with this email already exists. Sign in instead.',
  INVALID_LOGIN_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'No account found for this email.',
  WEAK_PASSWORD: 'Password is too weak. Use at least 6 characters.',
  OPERATION_NOT_ALLOWED: 'Email/password sign-in is not enabled in Firebase.',
};

export function mapFirebaseAuthError(codeOrMessage: string): string {
  const key = codeOrMessage.replace(/^auth\//, '').toUpperCase().replace(/-/g, '_');
  return FIREBASE_MESSAGES[key] ?? 'Authentication failed. Please try again.';
}

export function isEmailAlreadyExistsError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('already exists');
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code);
    return code.includes('email-already-exists') || code.includes('EMAIL_EXISTS');
  }
  return false;
}

export function mapAdminAuthError(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code);
    return mapFirebaseAuthError(code.replace('auth/', ''));
  }
  if (error instanceof Error) return error.message;
  return 'Authentication failed. Please try again.';
}
