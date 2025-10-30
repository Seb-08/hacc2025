import Link from "next/link";


/*
COLOR PALETTE
Dark Green [#032A3A]
Dark Green Blue [#103A4C]
Light Dark Green [#179A97]
Light Grey [#7D854]
Dark Grey [#7D8588]
Light Green [#DEE9ED]
White? [#F5F7F8]
Pure White [#FFFFFF]
*/
export default function Layer2Page() {
  return ( //Layer, THE TEXT IS ALL BLACK
    <main className="text-black">
     
    <div className="flex items-center gap-4">
        <button className="btn rounded-box bg-[#032A3A]">          
            <Link href="../">Back</Link>
        </button>


        <div className="flex items-center gap-4 rounded-box p-2 w-200 border-2 border-[#103A4C]">
            <label className="input bg-[#FFFFFF] rounded-box p-2 border-1 border-[#103A4C]"> {/*Search bar*/}
                <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                    >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                    </g>
                </svg>
                <input type="search" className="grow" placeholder="Search for Reports"/>
            </label>


            <div className="dropdown dropdown-start">
                <div tabIndex={0} role="button" className="btn rounded-box btn-outline m-1 border-2 border-[#103A4C] hover:bg-[#179A97] focus:bg-[#179A97] active:bg-[#179A97] focus:outline-none">Filter</div>
                <ul tabIndex={0} className="dropdown-content menu bg-[#FFFFFF] rounded-box p-2 border-2 border-[#179A97] focus:bg-[#FFFFFF] active:bg-[#FFFFFF] focus:outline-none">
                    <li><a>Placeholder</a></li>
                    <li><a>Placeholder</a></li>
                </ul>
            </div>  
            <div className="flex items-center gap-3">
                <input type="checkbox" className="checkbox"/>
                <p>Archived</p>
            </div>
            <div className="flex items-center gap-3">
                <input type="checkbox" className="checkbox"/>
                <p>Active</p>
            </div>
        </div>
    </div>
    <div className="flex items-center gap-4 mt-8">
        <div className="card w-80 border border-[#DEE9ED]">
            <div className="bg-[#179A97] flex items-center gap-4 p-4">
                <h2 className="text-white text-center font-bold">Project Title</h2>
            </div>
            <div className="card-body p-4 bg-white">
                <p className="text-center text-black">Project Description goes here.</p>
            </div>
        </div>
    </div>


    </main>
  );
}




