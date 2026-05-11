type ErrorLike = { code?: string; message?: string };

export function getFirebaseErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as ErrorLike).code;
    return typeof code === 'string' ? code : 'unknown';
  }
  return 'unknown';
}

export function getFirebaseFriendlyError(error: unknown): string {
  const code = getFirebaseErrorCode(error);
  const messages: Record<string, string> = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid or has already been used.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
    'auth/operation-not-allowed': 'This login method is not enabled in Firebase Console.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase Authentication.',
    'auth/unauthorized-continue-uri': 'This action link domain is not authorized in Firebase.',
    'auth/invalid-continue-uri': 'Invalid action link URL. Use an authorized production domain.',
    'auth/missing-continue-uri': 'Missing action link URL. Check NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_AUTH_ACTION_URL.',
    'auth/missing-password': 'Please enter your password.',
    'auth/network-request-failed': 'Connection issue. Please try again.',
    'auth/admin-restricted-operation': 'Guest mode is not enabled. Please use Google, Microsoft, or Email login.',
    'permission-denied': 'Permission denied. Please check Firestore rules.',
    unavailable: 'Connection issue. Please try again.',
    'deadline-exceeded': 'Request timed out. Please try again.',
    unauthenticated: 'Please login first.',
    'invalid-argument': 'Invalid data. Please try again.',
  };

  if (messages[code]) return messages[code];
  if (code.includes('/operation-not-allowed')) return messages['auth/operation-not-allowed'];
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const rawMessage = (error as ErrorLike).message ?? '';
    const message = rawMessage.toLowerCase();
    if (rawMessage.includes('Guest trial ended')) return rawMessage;
    if (rawMessage === 'Please enter a valid email address.' || rawMessage === 'Please enter your password.' || rawMessage === 'Password must be at least 6 characters.' || rawMessage === 'Passwords do not match.') return rawMessage;
    if (rawMessage === 'Invite code not found.' || rawMessage === 'This room is closed.' || rawMessage === 'This room is already full.') return rawMessage;
    if (rawMessage.includes('AADSTS50020')) return 'Microsoft login is not configured for this account type. Please use Google, Email, or Guest for now.';
    if (message.includes('permission')) return messages['permission-denied'];
    if (message.includes('deadline') || message.includes('timed out') || message.includes('timeout')) return messages['deadline-exceeded'];
    if (message.includes('not enabled') && message.includes('anonymous')) return messages['auth/admin-restricted-operation'];
    if (message.includes('firebase is not configured')) return 'Firebase is not configured. Add Firebase env vars to enable online features.';
    if (message.includes('login') || message.includes('auth')) return messages.unauthenticated;
  }
  return 'Something went wrong. Please try again.';
}

export const getFriendlyFirebaseError = getFirebaseFriendlyError;
