'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleAuthProviderWrapper({ children }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // If the env var isn't set, skip mounting the provider entirely. Sending
  // placeholder text to Google produces the cryptic "invalid_client" page —
  // better to render children directly and let any "Continue with Google"
  // button stay disabled until the env var is configured.
  if (!clientId) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[GoogleAuth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. ' +
        'Set it in .env.local (and on your hosting provider) to enable Google sign-in.'
      );
    }
    return children;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
