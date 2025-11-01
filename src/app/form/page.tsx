
'use client';


import { useEffect, useState } from 'react';


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
   <div className="max-w-md mx-auto p-4">
     <h1 className="text-xl font-bold mb-4">Create Monthly Report</h1>


     <form onSubmit={handleSubmit} className="space-y-4">
       {/* Department Dropdown */}
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
           className="w-full border p-2 rounded"
         >
           <option value="">Select department</option>
           {departments.map(d => (
             <option key={d.id} value={d.id}>{d.name}</option>
           ))}
         </select>
       </div>


       {/* Project Dropdown */}
       {selectedDepartment && (
         <div>
           <label className="block font-medium mb-1">Project</label>
           <select
             value={selectedProject?.id || ''}
             onChange={e => {
               const proj = projects.find(p => p.id === parseInt(e.target.value));
               setSelectedProject(proj || null);
               setNewProjectName('');
             }}
             className="w-full border p-2 rounded mb-2"
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
             className="w-full border p-2 rounded"
           />
         </div>
       )}


       {/* Issue Section */}
       <div>
         <label className="block font-medium mb-1">Issue</label>
         <select
           value={selectedIssue?.id || ''}
           onChange={e => {
             const issue = issues.find(i => i.id === parseInt(e.target.value));
             setSelectedIssue(issue || null);
             setNewIssue({ name: '', impact: 'Medium', issueDescription: '', recommendedSolution: '' });
           }}
           className="w-full border p-2 rounded mb-2"
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
             className="w-full border p-2 rounded mb-2"
           />
           <textarea
             placeholder="Issue description"
             value={newIssue.issueDescription}
             onChange={e => setNewIssue({ ...newIssue, issueDescription: e.target.value })}
             className="w-full border p-2 rounded mb-2"
           />
           <select
             value={newIssue.impact}
             onChange={e => setNewIssue({ ...newIssue, impact: e.target.value })}
             className="w-full border p-2 rounded mb-2"
           >
             <option>High</option>
             <option>Medium</option>
             <option>Low</option>
           </select>
         </div>
       </div>


       {/* Schedule Section */}
       <div>
         <label className="block font-medium mb-1">Schedule</label>
         <select
           value={selectedSchedule?.id || ''}
           onChange={e => {
             const sched = schedules.find(s => s.id === parseInt(e.target.value));
             setSelectedSchedule(sched || null);
             setNewSchedule({ featureName: '', deadlineDate: '', completed: false, status: 'open' });
           }}
           className="w-full border p-2 rounded mb-2"
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
             className="w-full border p-2 rounded mb-2"
           />
           <input
             type="date"
             value={newSchedule.deadlineDate}
             onChange={e => setNewSchedule({ ...newSchedule, deadlineDate: e.target.value })}
             className="w-full border p-2 rounded mb-2"
           />
           <label className="block mb-1">
             <input
               type="checkbox"
               checked={newSchedule.completed}
               onChange={e => setNewSchedule({ ...newSchedule, completed: e.target.checked })}
             />{' '}
             Completed
           </label>
           <select
             value={newSchedule.status}
             onChange={e => setNewSchedule({ ...newSchedule, status: e.target.value })}
             className="w-full border p-2 rounded"
           >
             <option>open</option>
             <option>closed</option>
           </select>
         </div>
       </div>


       {/* Report Data */}
       <div>
         <label className="block font-medium mb-1">Report Data</label>
         <textarea
           value={reportData}
           onChange={e => setReportData(e.target.value)}
           className="w-full border p-2 rounded"
         />
       </div>


       <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
         Create Report
       </button>
     </form>
   </div>
 );
}