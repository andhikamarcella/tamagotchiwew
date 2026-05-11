export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Please enter your password.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}
