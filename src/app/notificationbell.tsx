'use client';

import { Engagespot } from '@engagespot/react-component';
import { useEffect, useState } from 'react';

export default function NotificationBell() {
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch logged-in user
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data?.user) {
        // You can use either id or email — just be consistent
        setUserId(data.user.role === "admin" ? "admin@example.com" : "vendor@example.com");
      }
    })();
  }, []);

  if (!userId) return null;

  return (
    <div className="flex items-center justify-center">
      <Engagespot
        key={userId}
        apiKey={process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY!}
        userId={userId}
        theme={{
          colors: {
            brandingPrimary: '#2FB8AC', // ETS blue example
          },
          notificationButton: {
            iconFill: '#FFFFFF',
            background: 'transparent',
          },
        }}
      />
    </div>
  );
}
