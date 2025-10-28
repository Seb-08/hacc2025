import '~/styles/globals.css'
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'


const geist = Geist({ subsets: ['latin'], display: 'swap' })


export const metadata: Metadata = {
  title: 'Hawai‘i ETS',
  description: 'Enterprise Technology Services – State of Hawai‘i',
}


const navItems = ['Services', 'Projects', 'Records', 'Reports', 'Login']


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
        <div className="flex items-center gap-3">
          <img src="/hawaii-ets-logo.png" alt="Hawai‘i ETS Logo" className="h-12 w-auto" />
          <h1 className="text-lg font-semibold tracking-wide">
            Hawai‘i Enterprise Technology Services
          </h1>
        </div>
        <Navigation />
      </div>
      <div className="h-[4px] w-full bg-[#006D68]"></div>
    </header>
  )
}


function Navigation() {
  return (
    <nav className="flex items-center gap-8 text-sm font-medium">
      {navItems.map((item) => (
        <a
          key={item}
          href={`/${item.toLowerCase()}`}
          className="relative group text-white hover:text-gray-100 transition-all duration-300"
        >
          {item}
          <span className="absolute left-0 bottom-[-3px] w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
        </a>
      ))}
    </nav>
  )
}


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


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen flex flex-col bg-[#F5F7F8] text-[#002C3E]`}>
        <Header />
        <div className="h-[100px]" />
        <main className="flex-grow max-w-[1250px] mx-auto px-10 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

