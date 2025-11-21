// Hawai‘i ETS Homepage
'use client';

import React from 'react';

export default function Homepage() {
  return (
    <main className="bg-[#F4FAFA] text-[#002C3E] min-h-screen">
      <section className="flex flex-col items-center text-center min-h-[90vh] px-6 bg-gradient-to-b from-[#F4FAFA] to-[#E7F7F6] pt-24">
        <h2 className="text-5xl font-extrabold mb-6">
          Independent Verification and Validation Reports
        </h2>

        <p className="text-gray-700 mb-12 max-w-2xl mx-auto text-lg">
          Enterprise Technology Services (ETS) leads statewide IT strategy, cybersecurity,
          and digital services to better serve the people of Hawai‘i.
        </p>

        {/* Search → routes to /reports?q=... */}
        <form
          action="/reports"
          method="GET"
          className="flex justify-center items-center mb-12"
        >
          <input
            type="text"
            name="q"
            placeholder="Search ETS Reports"
            className="w-[750px] rounded-l-full border border-gray-300 text-gray-700 text-lg px-6 py-3.5
                       focus:outline-none focus:ring-2 focus:ring-[#2FA8A3] shadow-sm"
          />
          <button
            type="submit"
            className="bg-[#2FA8A3] hover:bg-[#24938f] text-white font-medium rounded-r-full px-8 py-[13px]
                       text-lg transition-colors border border-[#2FA8A3] -ml-[1px]"
          >
            Search
          </button>
        </form>

        <div className="flex justify-center gap-5">
          <a
            href="/reports"
            className="bg-[#2FA8A3] text-white hover:bg-[#24938f] text-base rounded-full px-8 py-3 transition-colors"
          >
            View All Reports
          </a>
          <a
            href="https://ets.hawaii.gov/report/independent-verification-and-validation-reports/"
            className="border border-[#2FA8A3] text-[#002C3E] hover:bg-[#E7F7F6] text-base rounded-full px-8 py-3 transition-colors"
          >
            Archived Reports
          </a>
        </div>
      </section>

      <div className="h-[6px] w-full bg-gradient-to-r from-[#00796B] to-[#2FA8A3]" />

      
    </main>
  );
}
