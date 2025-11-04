"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { projects } from "~/server/db/schema";
import { db } from "~/server/db";

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

Green Success [#5cb85c]
Red Fail [#de5a50]
*/
export default async function Layer2Page() {
    const projectName = await db.query.projects.findMany({
    columns: {
      name: true,
    },
  })

    const summaryReport = await db.query.monthlyReports.findMany({
        columns: {
            summary: true,
        }
    })



    
  return ( //Layer, THE TEXT IS ALL BLACK
    <main className="text-black">
     
    <div className="flex items-center gap-4">
        <button className="btn rounded-box bg-[#032A3A]">          
            <Link href="../">&larr; Back</Link>
        </button>

        {/*Search bar*/}
        <div className="flex items-center gap-4 rounded-box p-2 w-200 border-2 border-[#103A4C]">
            <label className="input bg-[#FFFFFF] rounded-box p-2 border-1 border-[#103A4C]"> 
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center mt-8">

        {/* Published */}
        {projectName.map((projectName,index) => (
        <div className="card w-[26rem] border border-[#DEE9ED] rounded-2xl shadow-md">
            <div className="relative bg-[#179A97] flex justify-center items-center p-6 rounded-t-2xl">
                <div>
                    <Link href="/">
                        <h2 className="text-white font-bold text-xl">{projectName.name}</h2>
                    </Link>
                </div>
            <div className="absolute top-3 right-3 rounded-xl bg-[#5cb85c] px-3 py-1">
                <h2 className="text-xs text-white">Active</h2>
            </div>
            </div>
            {summaryReport.map((summaryReport,index) => (
            <div className="card-body bg-white p-6 rounded-b-2xl">
                <p className="text-center text-base text-black">
                    {summaryReport.summary}
                </p>
            </div>
            ))}
        </div>
        ))}
        {/* In Progress */}
        <div className="card w-[26rem] border border-[#DEE9ED] rounded-2xl shadow-md">
            <div className="relative bg-[#179A97] flex justify-center items-center p-6 rounded-t-2xl">
                <h2 className="text-white font-bold text-xl">Project Title</h2>
            <div className="absolute top-3 right-3 rounded-xl bg-[#de5a50] px-3 py-1">
                <h2 className="text-xs text-white">Archive</h2>
            </div>
            </div>
            <div className="card-body bg-white p-6 rounded-b-2xl">
                <p className="text-center text-base text-black">
                    Project Description goes here.
                </p>
            </div>
        </div>
    </div>

    </main>
  );
}
