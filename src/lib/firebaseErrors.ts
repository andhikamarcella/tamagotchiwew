type ErrorLike = { code?: string; message?: string };

export function getFirebaseErrorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as ErrorLike).code;
    return typeof code === 'string' ? code : 'unknown';
  }
  return 'unknown';
}

export function getFriendlyFirebaseError(error: unknown): string {
  const code = getFirebaseErrorCode(error);
  const messages: Record<string, string> = {
    'auth/operation-not-allowed': 'This login method is not enabled in Firebase Console.',
    'auth/popup-closed-by-user': 'Login popup was closed.',
    'auth/popup-blocked': 'Popup was blocked. Trying redirect...',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase Authentication.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/missing-password': 'Please enter your password.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Connection issue. Please try again.',
    'auth/admin-restricted-operation': 'Guest mode is not enabled. Please use Google, Microsoft, or Email login.',
    'permission-denied': 'Permission denied. Check Firestore rules.',
    unavailable: 'Connection issue. Please try again.',
    unauthenticated: 'Please sign in first.',
    'invalid-argument': 'Invalid data. Please try again.',
  };

  if (messages[code]) return messages[code];
  if (code.includes('/operation-not-allowed')) return messages['auth/operation-not-allowed'];
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const rawMessage = (error as ErrorLike).message ?? '';
    const message = rawMessage.toLowerCase();
    if (rawMessage === 'Please enter a valid email address.' || rawMessage === 'Password must be at least 6 characters.') return rawMessage;
    if (rawMessage === 'Invite code not found.' || rawMessage === 'This room is closed.' || rawMessage === 'This room is already full.') return rawMessage;
    if (message.includes('permission')) return messages['permission-denied'];
    if (message.includes('not enabled') && message.includes('anonymous')) return messages['auth/admin-restricted-operation'];
    if (message.includes('firebase is not configured')) return 'Firebase is not configured. Add Firebase env vars to enable online features.';
  }
  return 'Something went wrong. Please try again.';
}
