'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              LegalGPT
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition">
                About Me
              </Link>
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition">
                LegalGPT
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-blue-600 transition">
                    {session.user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm text-gray-700">{session.user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        signOut({ redirect: true, callbackUrl: '/auth/signin' });
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:border-blue-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
