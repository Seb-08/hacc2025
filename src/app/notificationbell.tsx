'use client';

import { Engagespot } from '@engagespot/react-component';

/*const theme = {
  colors: { 
    colorPrimary: "#ffffffff",
    colorAccent: "#f10909ff" 
    },
};

export default function NotificationBell({ userId }: { userId: string }) {
  return (
    <Engagespot 
  apiKey="z5jqkoug6vgs00m1fc6li" 
  userId="unique-user-id"
  theme={theme}
/>
  );
}*/

// components/NotificationBell.tsx

export default function NotificationBell() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Engagespot bell */}
      <Engagespot
        apiKey="z5jqkoug6vgs00m1fc6li"
        userId="test-user"
        theme={{
          colors: {
            colorPrimary: '#FFFFFF', // fallback white
            brandingPrimary: '#FFFFFF',
          },
          notificationButton: {
            iconFill: '#FFFFFF',   // attempts to force bell white
            background: 'transparent',
            hoverBackground: 'rgba(255,255,255,0.1)',
          },
          dropdown: {
            iconFill: '#FFFFFF',
          },
        }}
      />

      {/* Manual red badge */}
      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
    </div>
  );
}
