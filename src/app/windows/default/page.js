'use client';
import { Eye, Clock, List } from 'lucide-react';

// (Simulated data for a summary view would be here)

export default function ViewerDashboard() {
    return (
        <div className="h-screen w-screen bg-slate-900 text-white font-sans flex flex-col overflow-hidden">
            <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                <div className="flex items-center gap-3"><Eye className="text-slate-400" size={32}/><div><h1 className="text-2xl font-bold">Depot Operations Overview</h1><p className="text-sm text-slate-400 font-bold text-yellow-400">READ-ONLY MODE</p></div></div>
                <div className="text-right"><p className="text-sm text-slate-400">Live Status as of</p><p className="text-lg font-bold">{new Date().toLocaleTimeString()}</p></div>
            </header>
            <main className="flex-grow grid grid-cols-2 gap-6 p-4 min-h-0">
                <section className="col-span-1 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                    <h2 className="text-xl font-bold text-center text-slate-400 mb-2">Depot Layout (Live View)</h2>
                    <div className="w-full h-5/6 bg-slate-800 rounded-lg flex items-center justify-center">
                        <p className="text-slate-600 font-bold text-2xl">STATIC SVG MAP</p>
                    </div>
                </section>
                 <section className="col-span-1 grid grid-rows-2 gap-6">
                    <div className="row-span-1 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <h2 className="text-xl font-bold">Key Performance Indicators</h2>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                             <div className="text-center"><p className="text-sm text-slate-400">Ready</p><p className="text-4xl font-bold text-blue-400">15</p></div>
                             <div className="text-center"><p className="text-sm text-slate-400">Maintenance</p><p className="text-4xl font-bold text-red-400">3</p></div>
                             <div className="text-center"><p className="text-sm text-slate-400">SLA Breaches</p><p className="text-4xl font-bold text-yellow-400">5%</p></div>
                        </div>
                    </div>
                     <div className="row-span-1 bg-slate-800/50 rounded-lg border border-slate-700 p-4 flex flex-col min-h-0">
                        <h2 className="text-xl font-bold flex-shrink-0 flex items-center gap-2"><List/> Live Activity Log</h2>
                         <div className="mt-2 flex-grow overflow-y-auto pr-2 text-sm text-slate-400">
                             <p><span className="text-slate-600">01:50:14 AM</span> System heartbeat check OK.</p>
                             <p><span className="text-slate-600">01:49:24 AM</span> TS-05 cleaning completed.</p>
                         </div>
                    </div>
                 </section>
            </main>
        </div>
    );
}