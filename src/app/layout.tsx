import '~/styles/globals.css'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import { LogIn } from 'lucide-react' // ← icon for login

const geist = Geist({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Hawai‘i ETS',
  description: 'Enterprise Technology Services – State of Hawai‘i',
}

// SIMPLE NAVIGATION CONFIG
const navItems = [
  { name: 'Homepage', path: '/' },
  { name: 'Reports', path: '/reports' },
  { name: 'Editor', path: '/form' },
  { name: 'Review', path: '/review' },
]

// HEADER 
function Header() {
  return (
    <header
      className="fixed top-0 left-0 w-full z-50 border-b-2 shadow-sm"
      style={{
        background: 'linear-gradient(90deg, #00796B, #2FB8AC)',
        borderColor: '#2FB8AC',
        color: '#FFFFFF',
      }}
    >
      <div className="max-w-[2250px] mx-auto flex items-center justify-between px-10 py-5">
        {/* ETS Logo and Site Title  */}
        <div className="flex items-center gap-3">
          <img
            src="https://lq4he0tkzv.ufs.sh/f/0EzP3waMS4PR39jxiXn6iEPtmsdYQDK9wLB50rhIX7jqeSH1"
            alt="Hawai‘i ETS Logo"
            className="h-12 w-auto"
          />
          <h1 className="text-lg font-semibold tracking-wide">
            Hawai‘i Enterprise Technology Services
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="relative group text-white hover:text-gray-100 transition-all duration-300"
            >
              {item.name}
              <span className="absolute left-0 bottom-[-3px] w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}

          {/* Login icon on far right */}
          <Link
            href="/login"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-white hover:bg-white hover:text-[#00796B] transition-all duration-300"
            title="Login"
          >
            <LogIn size={18} />
          </Link>
        </nav>
      </div>

      {/* Small divider bar under header */}
      <div className="h-[4px] w-full bg-[#006D68]" />
    </header>
  )
}

// FOOTER 
function Footer() {
  return (
    <footer
      className="text-center py-6 text-sm border-t border-[#2FB8AC] mt-auto"
      style={{ backgroundColor: '#002C3E', color: '#FFFFFF' }}
    >
      <p>© {new Date().getFullYear()} State of Hawai‘i — Enterprise Technology Services</p>
    </footer>
  )
}

// MAIN LAYOUT
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen flex flex-col bg-[#F5F7F8] text-[#002C3E]`}>
        {/* Always shows at the top */}
        <Header />

        {/* Spacer for fixed header*/}
        <div className="h-[100px]" />

        <main className="flex-grow max-w-[1250px] mx-auto px-10 py-10">{children}</main>

        {/* Always shows at the bottom */}
        <Footer />
      </body>
    </html>
  )
}
