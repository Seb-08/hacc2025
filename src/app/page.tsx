// Hawai‘i ETS Homepage
// Mililani High School - Kaila Wallace

import React from 'react'

export default function Homepage() {
  return (
    <main className="bg-[#F4FAFA] text-[#002C3E] min-h-screen">
      {/* Hero Section */}
      <section className="text-center py-24 px-6">
        <h2 className="text-4xl font-extrabold mb-4">
          Independent Verification and Validation Reports
        </h2>

        <p className="text-gray-700 mb-10 max-w-2xl mx-auto">
          Enterprise Technology Services (ETS) leads statewide IT strategy, cybersecurity,
          and digital services to better serve the people of Hawai‘i.
        </p>

        {/* Search Bar */}
        <div className="flex justify-center mb-10">
          <input
            type="text"
            placeholder="Search ETS Records"
            className="input input-bordered rounded-l-full w-full max-w-lg text-gray-700 focus:outline-none"
          />
          <button className="btn bg-[#2FA8A3] hover:bg-[#24938f] text-white rounded-r-full">
            Search
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <a href="/services" className="btn bg-[#2FA8A3] text-white hover:bg-[#24938f]">
            Explore Services
          </a>
          <a
            href="/projects"
            className="btn btn-outline border-[#2FA8A3] text-[#002C3E] hover:bg-[#E7F7F6]"
          >
            View Active Projects
          </a>
        </div>
      </section>

      {/* Divider */}
      <div className="h-[5px] bg-gradient-to-r from-[#00796B] to-[#2FA8A3] w-full"></div>

      {/* Quick Access Title */}
      <section className="py-16 bg-white text-center border-t border-gray-200">
        <h3 className="text-xl font-bold">Quick Access</h3>
      </section>
    </main>
  )
}
