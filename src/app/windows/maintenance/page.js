'use client';
import { useState } from "react";
import { Wrench, CheckCircle, BarChart } from 'lucide-react';

// (Simulated data and layout components would be here)
const initialJobs = [
    { id: 'JOB-8431', trainsetId: 'TS-04', description: 'Replace brake pads', priority: 'Critical', status: 'Open' },
    { id: 'JOB-8432', trainsetId: 'TS-18', description: 'HVAC filter cleaning', priority: 'Medium', status: 'Open' },
    { id: 'JOB-8425', trainsetId: 'TS-09', description: 'Wheel alignment check', priority: 'High', status: 'Completed' },
];

export default function TechnicianDashboard() {
    const [jobs, setJobs] = useState(initialJobs);
    const openJobs = jobs.filter(j => j.status === 'Open');

    return (
        <div className="h-screen w-screen bg-slate-900 text-white font-sans flex flex-col overflow-hidden">
             <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-3"><Wrench className="text-orange-400" size={32}/><div><h1 className="text-2xl font-bold">Maintenance Workbench</h1><p className="text-sm text-slate-400">Technician: Alice</p></div></div>
                <div className="text-right"><p className="text-sm text-slate-400">Open Job Cards</p><p className="text-2xl font-bold text-orange-400">{openJobs.length}</p></div>
            </header>
             <main className="flex-grow grid grid-cols-3 gap-6 p-4 min-h-0">
                <section className="col-span-2 flex flex-col min-h-0">
                    <h2 className="text-xl font-bold flex-shrink-0">Assigned Job Cards</h2>
                    <div className="mt-4 space-y-3 flex-grow overflow-y-auto pr-2">
                        {/* This would be the interactive "Job Card Management" component */}
                        {jobs.map(job => (
                             <div key={job.id} className={`p-3 rounded-lg flex justify-between items-center ${job.status === 'Open' ? 'bg-slate-700/80' : 'bg-slate-800 opacity-50'}`}>
                                <div><p className="font-bold">{job.trainsetId}: <span className="font-normal">{job.description}</span></p><p className={`text-xs font-bold ${job.priority === 'Critical' ? 'text-red-400' : 'text-yellow-400'}`}>{job.priority}</p></div>
                                {job.status === 'Open' && <button className="flex items-center gap-1 bg-green-600/50 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors"><CheckCircle size={14}/> Mark Closed</button>}
                            </div>
                        ))}
                    </div>
                </section>
                <aside className="col-span-1 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                     <h2 className="text-xl font-bold flex items-center gap-2"><BarChart/> IoT Live Data</h2>
                     <p className="text-sm text-slate-400 mt-4">Select a Trainset to view live wear data for diagnostics.</p>
                     <select className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 mt-2"><option>Select TS-04</option></select>
                     <div className="mt-4 space-y-2 text-sm">
                        <p>Brake Pads: 75%</p><div className="w-full bg-slate-700 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full w-3/4"></div></div>
                        <p>Wheels: 68%</p><div className="w-full bg-slate-700 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full w-2/3"></div></div>
                     </div>
                </aside>
             </main>
        </div>
    );
}