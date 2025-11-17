'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Same User + MeResponse types
type User = {
  email: string;
  role: 'admin' | 'vendor';
} | null;

type MeResponse =
  | { user: { id: number; email: string; role: 'admin' | 'vendor' } }
  | { user: null }
  | { error: string };

// Little helper for the circle + person icon
function CirclePersonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'h-5 w-5'}
      viewBox="0 0 24 24"
    >
      {/* Circle outline */}
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#002C3E"        // ETS dark color
        strokeWidth="2"
        fill="none"
      />
      {/* Person */}
      <path
        d="M12 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 7c-2.67 0-5 1.46-5 3.25V19c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-.75C17 16.46 14.67 15 12 15z"
        fill="#002C3E"          // ETS dark color
      />
    </svg>
  );
}

export default function AuthButtonClient() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  async function fetchMe() {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (!res.ok) {
        setUser(null);
        return;
      }

      const data: MeResponse = await res.json();
      if ('user' in data && data.user) {
        setUser({
          email: data.user.email,
          role: data.user.role,
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch /api/auth/me', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Run on mount AND whenever the route changes
  useEffect(() => {
    setLoading(true);
    void fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  async function handleClick() {
    if (loading) return;

    // If user is not logged in → go to login page
    if (!user) {
      router.push('/login');
      return;
    }

    // If logged in → logout, then go to login page
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (!res.ok) {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error', err);
    }

    setUser(null);
    router.refresh();
    router.push('/login');
  }

  // While checking auth, show neutral circle-person icon
  if (loading) {
    return (
      <button
        className="flex items-center justify-center w-9 h-9 rounded-full border border-white/60 bg-white/10 text-white/80 cursor-default"
        aria-label="Checking login status"
      >
        <CirclePersonIcon className="h-5 w-5" />
      </button>
    );
  }

  // Show same icon for login/logout, tooltip changes based on user state
  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-9 h-9 rounded-full border border-white bg-white/20 hover:bg-white hover:text-[#00796B] transition-all duration-300"
      title={user ? 'Logout' : 'Login'}
    >
      <CirclePersonIcon className="h-5 w-5" />
    </button>
  );
}
