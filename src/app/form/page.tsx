
'use client';


import { useEffect, useState } from 'react';
import Link from 'next/link';


interface Department {
 id: number;
 code: string;
 name: string;
}


interface Project {
 id: number;
 code: string;
 name: string;
 departmentId: number;
}


interface Issue {
 id: number;
 name: string;
 status: string;
 impact: string;
}


interface Schedule {
 id: number;
 featureName: string;
 status: string;
 completed: boolean;
}


export default function CreateReportPage() {
 const [departments, setDepartments] = useState<Department[]>([]);
 const [projects, setProjects] = useState<Project[]>([]);
 const [issues, setIssues] = useState<Issue[]>([]);
 const [schedules, setSchedules] = useState<Schedule[]>([]);


 const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
 const [selectedProject, setSelectedProject] = useState<Project | null>(null);
 const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
 const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);


 const [newProjectName, setNewProjectName] = useState('');
 const [newIssue, setNewIssue] = useState({ name: '', impact: 'Medium', issueDescription: '', recommendedSolution: '' });
 const [newSchedule, setNewSchedule] = useState({ featureName: '', deadlineDate: '', completed: false, status: 'open' });


 const [reportData, setReportData] = useState('');


 // Fetch departments on mount
 useEffect(() => {
   fetch('/api/departments')
     .then(res => res.json())
     .then(setDepartments)
     .catch(console.error);
 }, []);


 // Fetch projects when department changes
 useEffect(() => {
   if (!selectedDepartment) {
     setProjects([]);
     setSelectedProject(null);
     return;
   }


   fetch(`/api/projects?departmentId=${selectedDepartment.id}`)
     .then(res => res.json())
     .then(setProjects)
     .catch(console.error);
 }, [selectedDepartment]);


 // Fetch issues and schedules (optional filters by project later)
 useEffect(() => {
   fetch('/api/issues')
     .then(res => res.json())
     .then(setIssues)
     .catch(console.error);


   fetch('/api/schedules')
     .then(res => res.json())
     .then(setSchedules)
     .catch(console.error);
 }, []);


 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();


   if (!selectedDepartment) {
     alert('Please select a department.');
     return;
   }
   if (!selectedProject && !newProjectName) {
     alert('Please select an existing project or enter a new project name.');
     return;
   }


   const payload = {
     departmentId: selectedDepartment.id,
     existingProjectId: selectedProject?.id,
     projectName: newProjectName || undefined,
     reportData,
     issueId: selectedIssue?.id,
     scheduleId: selectedSchedule?.id,
     newIssue: newIssue.name ? newIssue : undefined,
     newSchedule: newSchedule.featureName ? newSchedule : undefined,
   };


   try {
     const res = await fetch('/api/createMonthlyReport', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(payload),
     });


     const data = await res.json();
     console.log('Report created:', data);
     alert(`Report created with warehouseId: ${data.warehouseId || data[0]?.warehouseId}`);


     // Reset form
     setSelectedDepartment(null);
     setSelectedProject(null);
     setNewProjectName('');
     setReportData('');
     setSelectedIssue(null);
     setSelectedSchedule(null);
     setNewIssue({ name: '', impact: 'Medium', issueDescription: '', recommendedSolution: '' });
     setNewSchedule({ featureName: '', deadlineDate: '', completed: false, status: 'open' });
   } catch (err) {
     console.error(err);
     alert('Error creating report');
   }
 };


 return (
    <div className="flex items-start bg-gray-50 text-gray-800 min-h-screen">
    {/* Sidebar */}
    <aside className="w-64 sticky top-0 h-screen flex-shrink-0 bg-[#179A97] text-white flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-[#158a87]">
          <h2 className="text-2xl font-semibold">Form Creation</h2>
        </div>
        <nav className="mt-6 px-2">
        
        <a href="#department-section" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#20b2af]">          Department & Project
          </a>
          <a href="#issue-section" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#20b2af]">
            Issue Details
          </a>
          <a href="#schedule-section" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#20b2af]">
            Schedule Details
          </a>
          <a href="#report-data-section" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#20b2af]">
            Report Data
          </a>
        </nav>
      </div>
      {/* This empty div creates space at the bottom. You can add footer items here later. */}
      <div></div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 p-10 scroll-smooth">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Create Monthly Report</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Department & Project Section */}
          <div id="department-section" className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Department</label>
              <select
                value={selectedDepartment?.id || ''}
                onChange={e => {
                  const dept = departments.find(d => d.id === parseInt(e.target.value));
                  setSelectedDepartment(dept || null);
                  setSelectedProject(null);
                  setNewProjectName('');
                }}
                className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {selectedDepartment && (
              <div id="project-section">
                <label className="block font-medium mb-1">Project</label>
                <select
                  value={selectedProject?.id || ''}
                  onChange={e => {
                    const proj = projects.find(p => p.id === parseInt(e.target.value));
                    setSelectedProject(proj || null);
                    setNewProjectName('');
                  }}
                  className="w-full border border-gray-300 p-2 rounded-md mb-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select existing project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter new project name"
                  value={newProjectName}
                  onChange={e => {
                    setNewProjectName(e.target.value);
                    setSelectedProject(null);
                  }}
                  className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </div>


       {/* Issue Section */}
       <div id="issue-section">
         <label className="block font-medium mb-1">Issue</label>
         <select
           value={selectedIssue?.id || ''}
           onChange={e => {
             const issue = issues.find(i => i.id === parseInt(e.target.value));
             setSelectedIssue(issue || null);
             setNewIssue({ name: '', impact: 'Medium', issueDescription: '', recommendedSolution: '' });
           }}
           className="w-full border border-gray-300 p-2 rounded-md mb-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
         >
           <option value="">Select existing issue</option>
           {issues.map(i => (
             <option key={i.id} value={i.id}>
               {i.name} ({i.status})
             </option>
           ))}
         </select>


         <div className="mt-2">
           <input
             type="text"
             placeholder="New issue name"
             value={newIssue.name}
             onChange={e => setNewIssue({ ...newIssue, name: e.target.value })}
             className="w-full border border-gray-300 p-2 rounded-md mb-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           />
           <textarea
             placeholder="Issue description"
             value={newIssue.issueDescription}
             onChange={e => setNewIssue({ ...newIssue, issueDescription: e.target.value })}
             className="w-full border border-gray-300 p-2 rounded-md mb-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           />
           <select
             value={newIssue.impact}
             onChange={e => setNewIssue({ ...newIssue, impact: e.target.value })}
             className="w-full border border-gray-300 p-2 rounded-md mb-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           >
             <option value="High">High</option>
             <option value="Medium">Medium</option>
             <option value="Low">Low</option>
           </select>
         </div>
       </div>


       {/* Schedule Section */}
       <div id="schedule-section">
         <label className="block font-medium mb-1">Schedule</label>
         <select
           value={selectedSchedule?.id || ''}
           onChange={e => {
             const sched = schedules.find(s => s.id === parseInt(e.target.value));
             setSelectedSchedule(sched || null);
             setNewSchedule({ featureName: '', deadlineDate: '', completed: false, status: 'open' });
           }}
           className="w-full border border-gray-300 p-2 rounded-md mb-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
         >
           <option value="">Select existing schedule</option>
           {schedules.map(s => (
             <option key={s.id} value={s.id}>
               {s.featureName} ({s.status})
             </option>
           ))}
         </select>


         <div className="mt-2">
           <input
             type="text"
             placeholder="Feature name"
             value={newSchedule.featureName}
             onChange={e => setNewSchedule({ ...newSchedule, featureName: e.target.value })}
             className="w-full border border-gray-300 p-2 rounded-md mb-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           />
           <input
             type="date"
             value={newSchedule.deadlineDate}
             onChange={e => setNewSchedule({ ...newSchedule, deadlineDate: e.target.value })}
             className="w-full border border-gray-300 p-2 rounded-md mb-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           />
           <label className="flex items-center mb-1">
             <input
               type="checkbox"
               checked={newSchedule.completed}
               onChange={e => setNewSchedule({ ...newSchedule, completed: e.target.checked })}
               className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
               />
               <span className="ml-2">Completed</span>
           </label>
           <select
             value={newSchedule.status}
             onChange={e => setNewSchedule({ ...newSchedule, status: e.target.value })}
             className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           >
             <option>open</option>
             <option>closed</option>
           </select>
         </div>
       </div>


       {/* Report Data */}
       <div id="report-data-section">
         <label className="block font-medium mb-1">Report Data</label>
         <textarea
           value={reportData}
           onChange={e => setReportData(e.target.value)}
           className="w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
           rows={4}
         />
       </div>


       <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
         Create Report
       </button>
       </form>
      </div>
    </main>
  </div>
 );
 
}
