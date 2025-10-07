'use client';
import { useState } from "react";
import { SlidersHorizontal, Clock, Plus, Train } from 'lucide-react';

// (Simulated data and layout components would be here)
const initialJobs = [
    { id: 1, trainsetId: 'TS-03', type: 'Daily Cleaning', bayId: 1, startTime: '23:00', endTime: '00:00', status: 'Scheduled' },
    { id: 2, trainsetId: 'TS-08', type: 'Deep Cleaning', bayId: 2, startTime: '23:00', endTime: '03:00', status: 'Scheduled' },
];

export default function SupervisorDashboard() {
    const [jobs, setJobs] = useState(initialJobs);

    return (
        <div className="h-screen w-screen bg-slate-900 text-white font-sans flex flex-col overflow-hidden">
             <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-3"><SlidersHorizontal className="text-cyan-400" size={32}/><div><h1 className="text-2xl font-bold">Operations & Scheduling</h1><p className="text-sm text-slate-400">Night Shift Supervisor</p></div></div>
                <div className="flex items-center gap-6">
                    <div className="text-center"><p className="text-sm text-slate-400">Cleaning Bays Free</p><p className="text-2xl font-bold text-green-400">1 / 3</p></div>
                    <div className="text-center"><p className="text-sm text-slate-400">Jobs Pending</p><p className="text-2xl font-bold text-yellow-400">{jobs.length}</p></div>
                </div>
            </header>
             <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 min-h-0">
                <section className="flex flex-col min-h-0">
                    <div className="flex justify-between items-center flex-shrink-0"><h2 className="text-xl font-bold">Cleaning Schedule (23:00 - 03:00)</h2><button className="flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-3 rounded-md hover:bg-blue-700 text-sm"><Plus size={16} className="mr-1"/>Schedule Job</button></div>
                    <div className="mt-4 space-y-3 flex-grow overflow-y-auto pr-2">
                        {/* This would be the interactive "Schedule List" component */}
                        {jobs.map(job => (
                             <div key={job.id} className="p-3 rounded-lg bg-slate-700/80 flex justify-between items-center"><p><span className="font-bold">{job.trainsetId}</span> - {job.type}</p><p className="text-xs text-slate-400">Bay {job.bayId} | {job.startTime} - {job.endTime}</p></div>
                        ))}
                    </div>
                </section>
                 <section className="flex flex-col min-h-0 space-y-4">
                    <div><h2 className="text-xl font-bold">Depot Layout (View-Only)</h2><div className="mt-2 bg-slate-800/50 rounded-lg border border-slate-700 p-4 h-64 flex items-center justify-center"><p className="text-slate-600 font-bold text-2xl">NON-INTERACTIVE SVG MAP</p></div></div>
                    <div><h2 className="text-xl font-bold">Open Maintenance Jobs</h2><div className="mt-2 bg-slate-800/50 rounded-lg border border-slate-700 p-4 flex-grow"><p className="text-slate-400 text-sm">TS-04: Brake wear critical</p></div></div>
                 </section>
            </main>
        </div>
    );
}