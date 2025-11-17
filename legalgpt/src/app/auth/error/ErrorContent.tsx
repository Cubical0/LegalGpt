'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    Callback: 'Invalid callback URL.',
    OAuthSignin: 'Error connecting to the OAuth provider.',
    OAuthCallback: 'Error in OAuth callback.',
    EmailSigninEmail: 'The email could not be sent.',
    AccessDenied: 'Access denied.',
    OAuthCreateAccount: 'Could not create OAuth user account.',
    EmailCreateAccount: 'Could not create user account.',
    OAuthAccountNotLinked: 'Email exists but is not linked to this account.',
    EmailSignInError: 'Could not sign in with email.',
    CredentialsSignin: 'Sign in failed. Check the details you provided are correct.',
    default: 'An authentication error occurred.',
  };

  const message = error ? (errorMessages[error] || errorMessages.default) : errorMessages.default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex gap-3">
          <Link
            href="/auth/signin"
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
