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
  icons: {
    icon: '/icon.png',
  },
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
                <h1 className="text-xs sm:text-base md:text-lg font-semibold tracking-wide leading-snug">
                  Hawai‘i Enterprise Technology Services
                </h1>
              </Link>

              {/* DESKTOP NAV */}
              <nav className="hidden md:flex flex-wrap items-center justify-end gap-6 text-sm font-medium">
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

              {/* MOBILE NAV */}
              <div className="md:hidden relative flex items-center">
                {/* hidden checkbox controls dropdown */}
                <input
                  id="nav-toggle"
                  type="checkbox"
                  className="peer hidden"
                />

                {/* hamburger button */}
                <label
                  htmlFor="nav-toggle"
                  className="p-2 rounded-md border border-white/70 bg-white/10 active:bg-white/20 inline-flex flex-col justify-center gap-1 cursor-pointer"
                  aria-label="Toggle navigation menu"
                >
                  <span className="w-5 h-[2px] bg-white block" />
                  <span className="w-5 h-[2px] bg-white block" />
                  <span className="w-5 h-[2px] bg-white block" />
                </label>

                {/* floating dropdown */}
                <div
                  className="
                    absolute right-0 top-full mt-2
                    bg-[#006D68]/95
                    rounded-lg shadow-lg border border-white/20
                    px-4 py-4
                    w-52
                    flex-col gap-3
                    hidden peer-checked:flex
                    z-50
                  "
                >
                  {/* TOP: Bell + Profile */}
                  <div className="flex justify-end items-center gap-3 pb-2 border-b border-white/20">
                    {user && <NotificationBell />}
                    <AuthButtonClient />
                  </div>

                  {/* Nav links */}
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      className="
                        text-sm text-white text-right
                        hover:text-gray-100 hover:underline
                        transition-colors
                      "
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="h-[3px] w-full bg-[#006D68]" />
        </header>

        {/* Spacer below fixed header */}
        <div className="h-[70px] sm:h-[82px] md:h-[96px]" />

        {/* MAIN CONTENT */}
        <main className="flex-grow w-full max-w-5xl mx-auto px-3 sm:px-5 lg:px-10 py-6 sm:py-8 md:py-10">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="relative mt-auto bg-[#002C3E] text-white">
          {/* Blurred background image like ETS */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: "url('/mnt/data/ets footer.PNG')" }}
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
            <div className="grid md:grid-cols-3 gap-10 md:gap-12">
              {/* ABOUT US */}
              <div>
                <h3 className="mb-4 tracking-widest text-sm font-semibold">
                  ABOUT US
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="border-b border-white/25 pb-2">
                    <a
                      href="https://ets.hawaii.gov/about/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Staff Biographies
                    </a>
                  </li>
                  <li className="border-b border-white/25 pb-2">
                    <a
                      href="https://ets.hawaii.gov/contact/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://ets.hawaii.gov/site-map/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Site Map
                    </a>
                  </li>
                </ul>
              </div>

              {/* POLICIES */}
              <div>
                <h3 className="mb-4 tracking-widest text-sm font-semibold">
                  POLICIES
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="border-b border-white/25 pb-2">
                    <a
                      href="https://portal.ehawaii.gov/page/terms-of-use/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Terms of Use
                    </a>
                  </li>
                  <li className="border-b border-white/25 pb-2">
                    <a
                      href="https://ets.hawaii.gov/accessibility-statement/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Accessibility
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://portal.ehawaii.gov/page/privacy-policy/"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>

              {/* CONTACT + SEAL + POWERED BY */}
              <div className="flex flex-col items-end gap-4">
                {/* Top row: contact pills + seal */}
                <div className="flex items-start gap-4">
                  {/* Contact "buttons" */}
                  <div className="space-y-3 text-xs sm:text-sm">
                    <a
                      href="tel:+18085866000"
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex items-center gap-2
                        rounded-full px-4 py-2
                        bg-black/45
                        shadow-sm
                        hover:bg-black/60
                        transition-colors
                      "
                    >
                      <span className="text-lg"></span>
                      <span>(808) 586-6000</span>
                    </a>

                    <a
                      href="mailto:ets@hawaii.gov"
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex items-center gap-2
                        rounded-full px-4 py-2
                        bg-black/45
                        shadow-sm
                        hover:bg-black/60
                        transition-colors
                      "
                    >
                      <span className="text-lg"></span>
                      <span>ets@hawaii.gov</span>
                    </a>
                  </div>

                  {/* Seal on the right */}
                  <img
                    src="https://lq4he0tkzv.ufs.sh/f/0EzP3waMS4PR0FOr7FaMS4PRIbXsHZruDtxCiOQBaYVockEl"
                    alt="State of Hawai‘i Seal"
                    className="h-20 sm:h-24 w-auto opacity-95"
                  />
                </div>

                {/* Powered by line */}
                <p className="text-xs sm:text-sm opacity-90">
                  Powered by{' '}
                  <a
                    href="https://portal.ehawaii.gov"
                    target="_blank"
                    rel="noreferrer"
                    className="italic hover:underline"
                  >
                    eHawaii.gov
                  </a>
                </p>
              </div>
            </div>

            {/* Divider + Copyright */}
            <div className="border-t border-white/30 mt-8 pt-3 text-[10px] sm:text-xs text-right">
              Copyright © {new Date().getFullYear()}, State of Hawai‘i. All
              rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}



