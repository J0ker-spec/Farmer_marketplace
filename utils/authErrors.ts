export function getAuthErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  const message = typeof error === 'object' && error && 'message' in error ? String((error as { message?: string }).message) : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Check your internet and try again.';
    case 'permission-denied':
      return 'Your account was created, but the profile could not be saved. Please contact support.';
    default:
      return message || 'Something went wrong. Please try again.';
  }
}
