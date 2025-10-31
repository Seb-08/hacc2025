import Link from "next/link";
import DependentDropdown from './DependentDropdown'

export default function MonthlyReports() {

return (
    <main>        
      <div className="navbar bg-[A26CA] shadow-sm w-full">
        <div className="navbar-center">
        </div>
      </div>
{/*
          <a className="btn btn-outline bg-white shadow border-2 border-teal-500 rounded-md text-teal-500">Aug</a>
          <a className="btn btn-outline bg-white shadow border-2 border-teal-500 rounded-md text-teal-500">Sep</a>
          <a className="btn btn-outline bg-white shadow border-2 border-teal-500 rounded-md text-teal-500">Oct</a>
   <div className="navbar-end">
    <ul className="menu menu-horizontal px-1">
      <li>
        <details>
          <summary>Year</summary>
          <ul className="bg-white rounded-t-none p-2">
            <li><a>2024</a></li>
            <li><a>2025</a></li>
          </ul>
        </details>
      </li>
    </ul>
        </div>
 */}

    <div className="min-h-screen bg-gray-100">
      {/* Full-bleed card: stretches the whole page width. Inner padding keeps content readable. */}
      <div className="w-full">
        <div className="bg-white shadow border-2 border-teal-500">
          <div className="px-8 md:px-16 lg:px-24 py-10">
      <div className="navbar bg-[A26CA] w-full">
        <div className="navbar-center">
            <h1 className="text-3xl font-semibold text-gray-900">Report #1</h1>
        </div>
        <div className="navbar-end">
            <div className="flex justify-end pt-4">
                <ul className="menu menu-horizontal px-1 ">
                <li>
                    <details>
                    <summary>Export</summary>
                    <ul className="bg-white rounded-t-none p-2">
                        <li><a>pdf</a></li>
                        <li><a>docx</a></li>
                    </ul>
                    </details>
                </li>
                </ul>
            </div>
        </div>
      </div>    
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-4">
          IV&V Report • Updated Oct 2025
        </label>

<h3>Schedule</h3>
<div className="carousel carousel-center rounded-box max-w-md space-x-4 p-4">
  <div className="carousel-item">
    <img
      src="https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp"
      className="rounded-box" />
  </div>
  <div className="carousel-item">
    <img
      src="https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp"
      className="rounded-box" />
  </div>
</div>

              <h3>Project Overview</h3>
              <div className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 px-4 py-2">
                Pursuant to HRS section 27-43.6, which requires the Chief Information Officer to submit
applicable independent verification and validation (IV&V) reports to the Legislature
within 10 days of receiving the report, please find attached the report the Office of
Enterprise Technology Services received for the State of Hawai‘i, Department of
Attorney General (AG), Child Enforcement Agency (CSEA).
              </div>
              <h3>Key Issues</h3>
              <div className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 px-4 py-2">
Non-critical tasks are being tracked alongside critical ones,
diluting focus and potentially straining resources. Financial
Test Deck (FTD) testing is blocked by unresolved defects,
stalling progress on 92% of pending case
              </div>
          </div>
        </div>
      </div>
    </div>
    </main>
  );
}