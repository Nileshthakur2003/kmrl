'use client';

import { useEffect, useState } from "react";
import { Clock, Plus, X, Train, Sparkles, Wind, ShieldCheck, Trash2, Loader2, ServerCrash, CheckCircle, Droplets, Target } from 'lucide-react';

// --- Configuration & Constants ---
const TOTAL_BAYS = 3;
const CLEANING_TYPES = {
  'Exterior Cleaning': { duration: 15, color: 'bg-teal-500', icon: <Wind size={14}/> },
  'Daily Cleaning': { duration: 60, color: 'bg-blue-500', icon: <Sparkles size={14}/> },
  'Deep Cleaning': { duration: 240, color: 'bg-purple-600', icon: <Droplets size={14}/> },
};

// --- UI Components ---

const ScheduleModal = ({ onClose, onSchedule, trainsetId }) => {
  const [cleaningType, setCleaningType] = useState('Daily Cleaning');
  const [bayId, setBayId] = useState(1);
  const [startTime, setStartTime] = useState("23:00");
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    const [hour, minute] = startTime.split(':').map(Number);
    // Basic time window check on the client
    if (hour < 23 && hour >= 3) {
        setError('Cleaning must be scheduled between 11 PM and 3 AM.');
        setIsSubmitting(false);
        return;
    }
    
    try {
        const response = await fetch('/api/job/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jobType: 'cleaning',
                trainsetId: trainsetId,
                description: `${cleaningType} for ${trainsetId}`,
                status: 'Open',
                details: { cleaningType, bayId, startTime: `1970-01-01T${startTime}:00.000Z` } // simple time representation
            })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to schedule job.');
        onSchedule(result.data); // Pass new job back to parent
        onClose();
    } catch (err) {
        setError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-slate-700">
        <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Schedule Cleaning for <span className="text-blue-400">{trainsetId}</span></h2><button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm">Cleaning Type</label><select value={cleaningType} onChange={e => setCleaningType(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 mt-1">{Object.keys(CLEANING_TYPES).map(ct => <option key={ct} value={ct}>{ct} ({CLEANING_TYPES[ct].duration} min)</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm">Assign to Bay</label><select value={bayId} onChange={e => setBayId(parseInt(e.target.value))} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 mt-1">{Array.from({length: TOTAL_BAYS}, (_, i) => <option key={i+1} value={i+1}>Bay {i+1}</option>)}</select></div>
            <div><label className="text-sm">Start Time</label><input type="time" step="900" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 mt-1"/></div>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-slate-600 flex items-center justify-center">
            {isSubmitting ? <Loader2 className="animate-spin"/> : 'Confirm Schedule'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main Dashboard ---

export default function CleaningOpsDashboard() {
    const [data, setData] = useState({ needsCleaning: [], scheduledJobs: [], bayStatuses: [], fleetCleaningReadiness: 100 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, trainsetId: null });

    const fetchData = async () => {
        try {
            const response = await fetch('/api/cleaning/summary');
            if (!response.ok) throw new Error('Failed to fetch cleaning operations data.');
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleScheduleSuccess = (newJob) => {
        // Optimistically update UI for better user experience
        setData(prev => ({
            ...prev,
            scheduledJobs: [...prev.scheduledJobs, newJob],
            needsCleaning: prev.needsCleaning.filter(t => t._id !== newJob.trainsetId),
        }));
        // Optionally, re-fetch for guaranteed consistency
        // fetchData();
    };
    
    // Admin action to cancel a job
    const handleCancelJob = async (jobId) => {
        if (!confirm('Are you sure you want to cancel this cleaning job?')) return;
        
        // This should be a DELETE request to /api/jobs/[id] in a full implementation
        console.log(`Cancelling job ${jobId}...`);
        setData(prev => ({
            ...prev,
            scheduledJobs: prev.scheduledJobs.filter(j => j._id !== jobId)
        }));
    };

    if (isLoading) return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-blue-500"/></div>;
    if (error) return <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-center p-8"><ServerCrash className="w-16 h-16 text-red-500 mb-4"/><h1 className="text-2xl font-bold">Error Loading Dashboard</h1><p className="text-red-400 mt-2">{error}</p></div>;

    return (
        <div className="min-h-screen w-full bg-slate-900 text-white font-sans p-4 sm:p-8">
            {modalState.isOpen && <ScheduleModal onClose={() => setModalState({isOpen: false, trainsetId: null})} onSchedule={handleScheduleSuccess} trainsetId={modalState.trainsetId} />}

            <header className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <div><h1 className="text-4xl font-bold">Cleaning Operations Center</h1><p className="text-slate-400 mt-1">Manage and monitor all trainset cleaning activities.</p></div>
                <div className="text-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400 flex items-center gap-2"><Target/> Fleet Cleaning Readiness</p>
                    <p className="text-4xl font-bold text-green-400">{data.fleetCleaningReadiness.toFixed(1)}%</p>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Trainsets Requiring Cleaning */}
                <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"><h2 className="text-xl font-bold mb-3">Trainsets Requiring Cleaning</h2><div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">{data.needsCleaning.length > 0 ? data.needsCleaning.map(train => (
                    <div key={train._id} className="bg-slate-700 p-2 rounded-md flex justify-between items-center"><p className="font-bold">{train._id}</p><button onClick={() => setModalState({isOpen: true, trainsetId: train._id})} className="bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded hover:bg-blue-700">Schedule Clean</button></div>
                )) : <p className="text-sm text-center text-slate-500 pt-4">All trainsets are clean or scheduled.</p>}</div></section>
                
                {/* Column 2: Scheduled Jobs */}
                <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"><h2 className="text-xl font-bold mb-3">Scheduled Cleaning Jobs</h2><div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">{data.scheduledJobs.length > 0 ? data.scheduledJobs.map(job => (
                    <div key={job._id} className="p-2 rounded-lg bg-slate-700/70 flex justify-between items-center">
                        <div className="flex items-center gap-3"><span className={`p-1.5 rounded-md ${CLEANING_TYPES[job.details.cleaningType]?.color || 'bg-slate-500'}`}>{CLEANING_TYPES[job.details.cleaningType]?.icon || <Sparkles size={14}/>}</span><div><p className="font-semibold text-sm">{job.trainsetId} - {job.details.cleaningType}</p><p className="text-xs text-slate-400">Bay {job.details.bayId} | Status: {job.status}</p></div></div>
                        <button onClick={() => handleCancelJob(job._id)} className="text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                    </div>
                )) : <p className="text-sm text-center text-slate-500 pt-4">No cleaning jobs scheduled.</p>}</div></section>

                {/* Column 3: Bay Status */}
                <section className="bg-slate-800/50 p-4 rounded-lg border border-slate-700"><h2 className="text-xl font-bold mb-3">Real-Time Bay Status</h2><div className="space-y-4">{data.bayStatuses.map(bay => (
                    <div key={bay.bayId} className={`p-4 rounded-lg border-2 ${bay.status === 'Occupied' ? 'border-blue-500 bg-blue-500/10' : 'border-green-500 bg-green-500/10'}`}>
                        <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Cleaning Bay {bay.bayId}</h3><span className={`px-2 py-0.5 text-xs font-bold rounded-full ${bay.status === 'Occupied' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'}`}>{bay.status.toUpperCase()}</span></div>
                        {bay.status === 'Occupied' && bay.currentJobId && <div className="mt-2"><p className="font-bold text-sm">{bay.currentJobId.trainsetId}</p><p className="text-xs text-slate-400">{bay.currentJobId.cleaningType}</p></div>}
                    </div>
                ))}</div></section>
            </main>
        </div>
    );
}
