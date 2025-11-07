'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // ✅ Login successful — refresh layout so nav updates
      // and redirect to appropriate place (e.g. /reports)
      router.push('/reports');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-[#002C3E] mb-2">
          Sign in to Hawai‘i ETS
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Vendor and Admin access only. Public users may browse reports without signing in.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="flex items-center gap-2 border rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-[#2FA8A3]">
              <Mail size={16} className="text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-800"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center gap-2 border rounded-full px-3 py-2 focus-within:ring-2 focus-within:ring-[#2FA8A3]">
              <Lock size={16} className="text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-800"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#2FA8A3] hover:bg-[#24938f] text-white font-semibold py-2.5 rounded-full text-sm transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Info */}
        <p className="mt-4 text-[11px] text-gray-500 leading-relaxed">
          This environment is for demonstration and internal use. Public visitors can
          browse approved reports without logging in. Vendors may edit reports. Admins
          may review and approve monthly snapshots.
        </p>
      </div>
    </main>
  );
}
