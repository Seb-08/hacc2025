// Hawai‘i ETS Homepage
'use client';

import React, { useEffect, useState } from 'react';

export default function Homepage() {
  // --- Smooth Typing Effect ---
const suggestions: string[] = [
  'Search ETS Reports',
  'Health',
  'Human Services',
  'Commerce and Consumer Affairs',
];

const [placeholder, setPlaceholder] = useState('');
const [index, setIndex] = useState(0);
const [subIndex, setSubIndex] = useState(0);
const [deleting, setDeleting] = useState(false);

useEffect(() => {
  const currentText = suggestions[index] ?? ""; 

  const speed = deleting ? 60 : 70;

  const handler = setTimeout(() => {
    if (!deleting) {
      // typing forward
      setPlaceholder(currentText.substring(0, subIndex + 1));
      setSubIndex((prev) => prev + 1);

      if (subIndex === currentText.length) {
        setTimeout(() => setDeleting(true), 1200);
      }
    } else {
      // deleting backward
      setPlaceholder(currentText.substring(0, subIndex - 1));
      setSubIndex((prev) => prev - 1);

      if (subIndex === 0) {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % suggestions.length);
      }
    }
  }, speed);

  return () => clearTimeout(handler);
}, [subIndex, deleting, index, suggestions]);


  return (
    <div
      className="
        bg-[#F4FAFA] text-[#002C3E]
        min-h-[calc(100vh-150px)] sm:min-h-[calc(100vh-150px)] md:min-h-[calc(100vh-160px)]
        flex items-start justify-center
        pt-8 sm:pt-10 md:pt-12
        px-4 sm:px-6
      "
    >
      <section
        className="
          w-full max-w-4xl mx-auto
          flex flex-col items-center text-center
        "
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-5 sm:mb-6 leading-tight">
          Independent Verification and Validation Reports
        </h2>

        {/* Original sub-header formatting */}
        <p className="text-gray-700 mb-12 max-w-2xl mx-auto text-lg">
          Enterprise Technology Services (ETS) leads statewide IT strategy, cybersecurity,
          and digital services to better serve the people of Hawai‘i.
        </p>

        {/* Search */}
        <form
          action="/reports"
          method="GET"
          className="
            flex flex-col sm:flex-row 
            justify-center items-stretch sm:items-center 
            gap-3 sm:gap-0 
            mb-8 sm:mb-10 
            w-full max-w-2xl mx-auto
          "
        >
          <input
            type="text"
            name="q"
            placeholder={placeholder || 'Search ETS Reports'}
            className="
              flex-1 w-full
              rounded-full sm:rounded-l-full sm:rounded-r-none
              border border-gray-300 text-gray-700
              text-sm sm:text-base md:text-lg 
              px-4 sm:px-6 py-2.5 sm:py-3
              focus:outline-none focus:ring-2 focus:ring-[#2FA8A3] shadow-sm
              placeholder:text-gray-400
            "
          />

          <button
            type="submit"
            className="
              bg-[#2FA8A3] hover:bg-[#2B8985] text-white font-medium
              rounded-full sm:rounded-r-full sm:rounded-l-none
              px-5 sm:px-7 md:px-8 py-2.5 sm:py-3 
              text-sm sm:text-base md:text-lg
              transition-colors border border-[#2FA8A3]
            "
          >
            Search
          </button>
        </form>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-5 w-full max-w-md mx-auto">
          <a
            href="/reports"
            className="
              bg-[#2FA8A3] text-white hover:bg-[#2B8985] 
              text-sm sm:text-base 
              rounded-full px-6 sm:px-8 py-2.5 sm:py-3 
              transition-colors text-center
            "
          >
            View All Reports
          </a>

          {/* Archived Reports + Tooltip */}
          <div className="relative group">
            <a
              href="https://ets.hawaii.gov/report/independent-verification-and-validation-reports/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                border border-[#2FA8A3] text-[#002C3E] hover:bg-[#E7F7F6] 
                text-sm sm:text-base 
                rounded-full px-6 sm:px-8 py-2.5 sm:py-3 
                transition-colors text-center block
              "
            >
              Archived Reports
            </a>

            {/* Teal Tooltip */}
            <div
              className="
                absolute left-1/2 -translate-x-1/2 mt-2
                px-3 py-1.5 rounded-md
                bg-[#2FA8A3] text-white text-xs font-medium
                border border-[#2FA8A3]
                shadow-lg shadow-[#2FA8A3]/30
                whitespace-nowrap min-w-max

                opacity-0 scale-95 translate-y-1 pointer-events-none
                group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 group-hover:pointer-events-auto
                transition-all duration-200
              "
            >
              External link
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
