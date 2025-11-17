'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link href="/" className="text-xl md:text-2xl font-bold text-blue-600 flex-shrink-0">
              LegalGPT
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition text-sm">
                About
              </Link>
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition text-sm">
                Home
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {session?.user && (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-blue-600 transition text-sm">
                    {session.user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg z-50 top-full">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm text-gray-700 truncate">{session.user.email}</p>
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
            )}

            {!session?.user && (
              <div className="hidden md:flex space-x-2 md:space-x-3">
                <Link
                  href="/auth/signin"
                  className="px-3 md:px-4 py-2 text-gray-700 border border-gray-300 rounded hover:border-blue-600 transition text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 rounded transition"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-3 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition"
              onClick={() => setShowMobileMenu(false)}
            >
              About
            </Link>
            {session?.user ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-700 border-t border-gray-200 pt-3">
                  {session.user.email}
                </div>
                <button
                  onClick={() => {
                    signOut({ redirect: true, callbackUrl: '/auth/signin' });
                    setShowMobileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block px-4 py-2 text-gray-700 border border-gray-300 rounded hover:border-blue-600 transition text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
