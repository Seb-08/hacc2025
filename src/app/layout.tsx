import '~/styles/globals.css';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { getCurrentUser } from '~/lib/auth';
import AuthButtonClient from '~/components/AuthButtonClient';
import NotificationBell from './notificationbell';

const geist = Geist({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Hawai‘i ETS',
  description: 'Enterprise Technology Services – State of Hawai‘i',
};

const baseNavItems = [
  { name: 'Reports', path: '/reports' },
];

const editorNav = { name: 'Editor', path: '/form' };
const reviewNav = { name: 'Review', path: '/review' };

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  const navItems = [...baseNavItems];
  if (user && (user.role === 'vendor' || user.role === 'admin')) {
    navItems.push(editorNav);
  }
  if (user && user.role === 'admin') {
    navItems.push(reviewNav);
  }

  return (
    <html lang="en">
      <body
        className={`${geist.className} min-h-screen flex flex-col bg-[#F5F7F8] text-[#002C3E]`}
      >
        {/* HEADER */}
        <header
          className="fixed top-0 left-0 w-full z-50 border-b-2 shadow-sm"
          style={{
            background: 'linear-gradient(90deg, #00796B, #2FB8AC)',
            borderColor: '#2FB8AC',
            color: '#FFFFFF',
          }}
        >
          <div className="w-full px-4 sm:px-6 lg:px-10 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            {/* Logo + Title */}
            <Link href="/" className="flex items-center gap-3">
              <img
                src="https://lq4he0tkzv.ufs.sh/f/0EzP3waMS4PR39jxiXn6iEPtmsdYQDK9wLB50rhIX7jqeSH1"
                alt="Hawai‘i ETS Logo"
                className="h-10 w-auto sm:h-12"
              />
              <h1 className="text-base sm:text-lg font-semibold tracking-wide">
                Hawai‘i Enterprise Technology Services
              </h1>
            </Link>

            {/* NAVIGATION */}
            <nav className="flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-5 md:gap-8 text-xs sm:text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="relative group text-white hover:text-gray-100 transition-all duration-300"
                >
                  {item.name}
                  <span className="absolute left-0 bottom-[-3px] w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}

              {user && <NotificationBell />}

              {/* PERSON ICON LOGIN */}
              <AuthButtonClient />
            </nav>
          </div>

          <div className="h-[3px] w-full bg-[#006D68]" />
        </header>

        <div className="h-[88px] sm:h-[96px]" />

        <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
          {children}
        </main>

        <footer
          className="text-center py-5 sm:py-6 text-xs sm:text-sm border-t border-[#2FB8AC] mt-auto"
          style={{ backgroundColor: '#002C3E', color: '#FFFFFF' }}
        >
          <p>
            © {new Date().getFullYear()} State of Hawai‘i — Enterprise
            Technology Services
          </p>
        </footer>
      </body>
    </html>
  );
}
