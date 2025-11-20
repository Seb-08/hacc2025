import '~/styles/globals.css';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import { getCurrentUser } from '~/lib/auth';
import AuthButtonClient from '~/components/AuthButtonClient';
import NotificationBell from './notificationbell';

const geist = Geist({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Hawai‘i ETS',
  description: 'Enterprise Technology Services – State of Hawai‘i',
};

export const dynamic = 'force-dynamic';

const baseNavItems = [
  { name: 'Homepage', path: '/' },
  { name: 'Reports', path: '/reports' },
];

const editorNav = { name: 'Editor', path: '/form' };
const reviewNav = { name: 'Review', path: '/review' };

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  noStore();

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
          <div className="w-full px-3 sm:px-5 lg:px-10 py-3 md:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Logo + Title */}
              <Link href="/" className="flex items-center gap-2 sm:gap-3">
                <img
                  src="https://lq4he0tkzv.ufs.sh/f/0EzP3waMS4PR39jxiXn6iEPtmsdYQDK9wLB50rhIX7jqeSH1"
                  alt="Hawai‘i ETS Logo"
                  className="h-8 w-auto sm:h-10 md:h-12"
                />
                <h1 className="text-sm sm:text-base md:text-lg font-semibold tracking-wide leading-snug">
                  Hawai‘i Enterprise Technology Services
                </h1>
              </Link>

              {/* DESKTOP NAV */}
              <nav
                className="
                  hidden md:flex
                  flex-wrap items-center justify-end
                  gap-3 sm:gap-4 md:gap-6
                  text-[11px] sm:text-xs md:text-sm font-medium
                "
              >
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

                <AuthButtonClient />
              </nav>

              {/* MOBILE HAMBURGER NAV */}
              <div className="md:hidden flex items-center">
                <div className="flex flex-col items-end">
                  {/* Hidden checkbox controls the dropdown via peer */}
                  <input
                    id="nav-toggle"
                    type="checkbox"
                    className="peer hidden"
                  />

                  {/* hamburger button */}
                  <label
                    htmlFor="nav-toggle"
                    className="
                      p-2 rounded-md border border-white/70
                      inline-flex flex-col justify-center gap-1
                      bg-white/10 active:bg-white/20
                    "
                    aria-label="Toggle navigation menu"
                  >
                    <span className="w-5 h-[2px] bg-white block" />
                    <span className="w-5 h-[2px] bg-white block" />
                    <span className="w-5 h-[2px] bg-white block" />
                  </label>

                  {/* Dropdown menu */}
                  <div
                    className="
                      mt-2
                      bg-[#006D68]/95
                      rounded-md shadow-lg border border-white/20
                      px-4 py-3
                      flex-col gap-2 items-stretch
                      hidden peer-checked:flex
                      min-w-[170px]
                    "
                  >
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.path}
                        className="
                          text-xs text-white text-right
                          hover:text-gray-100 hover:underline
                          transition-colors
                        "
                      >
                        {item.name}
                      </Link>
                    ))}

                    <div className="flex items-center justify-end gap-3 mt-2">
                      {user && <NotificationBell />}
                      <AuthButtonClient />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[3px] w-full bg-[#006D68]" />
        </header>

        {/* Spacer under fixed header */}
        <div className="h-[70px] sm:h-[82px] md:h-[96px]" />

        {/* MAIN CONTENT */}
        <main className="flex-grow w-full max-w-5xl mx-auto px-3 sm:px-5 lg:px-10 py-6 sm:py-8 md:py-10">
          {children}
        </main>

        {/* FOOTER */}
        <footer
          className="text-center py-4 sm:py-5 text-xs sm:text-sm border-t border-[#2FB8AC] mt-auto"
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
