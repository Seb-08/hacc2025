'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LogIn, LogOut } from 'lucide-react';

type User = {
  email: string;
  role: 'admin' | 'vendor';
} | null;

type MeResponse =
  | { user: { id: number; email: string; role: 'admin' | 'vendor' } }
  | { user: null }
  | { error: string };

export default function AuthButtonClient() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // used to detect route changes

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
    router.refresh(); // ensure server components see cleared cookie
    router.push('/login'); // 👈 redirect to login after logout
  }

  // While checking auth, show neutral login icon
  if (loading) {
    return (
      <button
        className="flex items-center justify-center w-9 h-9 rounded-full border border-white/60 text-white/80 cursor-default"
        aria-label="Checking login status"
      >
        <LogIn size={18} />
      </button>
    );
  }

  // Show Login or Logout based on user state
  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-9 h-9 rounded-full border border-white hover:bg-white hover:text-[#00796B] transition-all duration-300"
      title={user ? 'Logout' : 'Login'}
    >
      {user ? <LogOut size={18} /> : <LogIn size={18} />}
    </button>
  );
}
