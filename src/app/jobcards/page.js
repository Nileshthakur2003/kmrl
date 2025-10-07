'use client';

import { useEffect, useState, useMemo } from "react";
import { Search, Filter, CheckCircle, AlertOctagon, Wrench, Shield, Zap } from 'lucide-react';

// --- Enhanced Data Simulation ---

const technicians = ["Alice", "Bob", "Carlos", "Diana", "Eve", "Frank"];
const priorities = ["Critical", "High", "Medium", "Low"];
const descs = [
  "Brake system recalibration", "Bogie frame inspection", "HVAC filter replacement", 
  "Pantograph pressure check", "Door sensor alignment", "Communication system diagnostics",
  "Wheel profile measurement", "Auxiliary power unit test"
];

function generateJobCard(trainsetId, carId, status) {
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  return {
    id: `JOB-${Math.floor(1000 + Math.random() * 9000)}`,
    trainsetId,
    carId,
    description: descs[Math.floor(Math.random() * descs.length)],
    status, // "Open" or "Closed"
    priority,
    technician: technicians[Math.floor(Math.random() * technicians.length)],
    estimatedHours: (Math.random() * 8 + 1).toFixed(1),
    dateOpened: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };
}

// --- Reusable UI Components (Structured for clarity) ---

const DashboardMetric = ({ icon, label, value, color }) => (
  <div className="bg-slate-800/50 p-4 rounded-lg flex items-center space-x-4">
    <div className={`p-3 rounded-md ${color}/20`}>{icon}</div>
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

const TrainsetHealthCard = ({ trainset, onSelect, isSelected }) => {
  const getHealthColor = (health) => {
    if (health < 50) return { text: 'text-red-400', border: 'border-red-500', bg: 'bg-red-500/10' };
    if (health < 85) return { text: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-500/10' };
    return { text: 'text-green-400', border: 'border-green-500', bg: 'bg-green-500/10' };
  };

  const { text, border, bg } = getHealthColor(trainset.health);

  return (
    <div 
      onClick={() => onSelect(trainset.id)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? `bg-blue-500/20 border-blue-400` : `${bg} ${border}`}`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">🚈 Trainset {trainset.id + 1}</h3>
        <p className={`text-2xl font-bold ${text}`}>{trainset.health.toFixed(0)}%</p>
      </div>
      <p className="text-xs text-slate-400">
        {trainset.openJobs} Open / {trainset.totalJobs} Total Jobs
      </p>
    </div>
  );
};

const JobCard = ({ job, onCloseJob }) => {
  const priorityStyles = {
    Critical: { icon: <AlertOctagon className="w-4 h-4 text-red-400"/>, tag: "bg-red-500/20 text-red-300" },
    High: { icon: <Zap className="w-4 h-4 text-yellow-400"/>, tag: "bg-yellow-500/20 text-yellow-300" },
    Medium: { icon: <Wrench className="w-4 h-4 text-blue-400"/>, tag: "bg-blue-500/20 text-blue-300" },
    Low: { icon: <Shield className="w-4 h-4 text-green-400"/>, tag: "bg-green-500/20 text-green-300" },
  };
  const { icon, tag } = priorityStyles[job.priority];

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-mono text-xs text-slate-400">{job.id} / TS-{job.trainsetId+1} / C-{job.carId+1}</p>
          <p className="font-bold text-white">{job.description}</p>
        </div>
        {job.status === "Open" && (
          <button 
            onClick={() => onCloseJob(job.id)}
            className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-2 rounded-md transition-colors"
          >
            Mark Closed
          </button>
        )}
      </div>
      <div className="flex justify-between items-center text-xs text-slate-300 border-t border-slate-700 pt-2">
        <span className={`px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${tag}`}>{icon}{job.priority}</span>
        <span>Tech: {job.technician}</span>
        <span>Est: {job.estimatedHours} hrs</span>
        <span>Opened: {job.dateOpened}</span>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

export default function JobCardDashboard() {
  const [allJobs, setAllJobs] = useState([]);
  const [trainsetData, setTrainsetData] = useState([]);
  const [selectedTrainset, setSelectedTrainset] = useState(null);
  
  // Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Open');
  const [filterPriority, setFilterPriority] = useState('All');

  // Initial data generation and refresh interval
  useEffect(() => {
    function generateInitialData() {
      const NUM_TRAINSETS = 3;
      const CARS_PER_TRAINSET = 4;
      let jobs = [];
      for (let ts = 0; ts < NUM_TRAINSETS; ts++) {
        for (let car = 0; car < CARS_PER_TRAINSET; car++) {
          const openJobCount = Math.floor(Math.random() * 5);
          const closedJobCount = Math.floor(Math.random() * 10);
          for(let i = 0; i < openJobCount; i++) jobs.push(generateJobCard(ts, car, "Open"));
          for(let i = 0; i < closedJobCount; i++) jobs.push(generateJobCard(ts, car, "Closed"));
        }
      }
      setAllJobs(jobs);
    }
    generateInitialData();
  }, []);

  // Calculate trainset health whenever jobs data changes
  useEffect(() => {
    const priorityWeights = { Critical: 10, High: 5, Medium: 2, Low: 1 };
    const trainsets = {};

    allJobs.forEach(job => {
      if (!trainsets[job.trainsetId]) {
        trainsets[job.trainsetId] = { id: job.trainsetId, maxScore: 0, penalty: 0, openJobs: 0, totalJobs: 0 };
      }
      const weight = priorityWeights[job.priority] || 0;
      trainsets[job.trainsetId].maxScore += weight;
      trainsets[job.trainsetId].totalJobs += 1;
      if (job.status === 'Open') {
        trainsets[job.trainsetId].penalty += weight;
        trainsets[job.trainsetId].openJobs += 1;
      }
    });

    const calculatedData = Object.values(trainsets).map(ts => ({
      ...ts,
      health: ts.maxScore > 0 ? (1 - (ts.penalty / ts.maxScore)) * 100 : 100,
    }));
    setTrainsetData(calculatedData);
  }, [allJobs]);

  const handleCloseJob = (jobId) => {
    setAllJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, status: 'Closed' } : job
      )
    );
  };
  
  const filteredJobs = useMemo(() => {
    return allJobs
      .filter(job => selectedTrainset === null || job.trainsetId === selectedTrainset)
      .filter(job => filterStatus === 'All' || job.status === filterStatus)
      .filter(job => filterPriority === 'All' || job.priority === filterPriority)
      .filter(job => 
        job.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.dateOpened) - new Date(a.dateOpened));
  }, [allJobs, selectedTrainset, filterStatus, filterPriority, searchTerm]);

  // Dashboard header metrics
  const openCriticalJobs = allJobs.filter(j => j.status === 'Open' && j.priority === 'Critical').length;
  const totalOpenJobs = allJobs.filter(j => j.status === 'Open').length;
  const fleetHealth = trainsetData.length > 0 ? trainsetData.reduce((acc, ts) => acc + ts.health, 0) / trainsetData.length : 100;

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-slate-900 text-white">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">🛠️ Job Card Management Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardMetric icon={<AlertOctagon className="w-7 h-7"/>} label="Open Critical Jobs" value={openCriticalJobs} color="text-red-400" />
          <DashboardMetric icon={<Wrench className="w-7 h-7"/>} label="Total Open Jobs" value={totalOpenJobs} color="text-yellow-400" />
          <DashboardMetric icon={<CheckCircle className="w-7 h-7"/>} label="Jobs Closed (Session)" value={allJobs.filter(j=>j.status === 'Closed').length} color="text-green-400" />
          <DashboardMetric icon={<Shield className="w-7 h-7"/>} label="Overall Fleet Health" value={`${fleetHealth.toFixed(1)}%`} color="text-blue-400" />
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Trainset Health */}
        <aside className="lg:col-span-1 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Trainset Health Overview</h2>
          <div className="space-y-3">
            {trainsetData.map(ts => (
              <TrainsetHealthCard key={ts.id} trainset={ts} onSelect={setSelectedTrainset} isSelected={selectedTrainset === ts.id} />
            ))}
             {selectedTrainset !== null && (
              <button onClick={() => setSelectedTrainset(null)} className="w-full text-center text-sm mt-2 text-blue-400 hover:underline">
                Show All Trainsets
              </button>
            )}
          </div>
        </aside>

        {/* Right Panel: Job List */}
        <section className="lg:col-span-2 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
              <input type="text" placeholder="Search ID or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md pl-10 pr-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500">
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:ring-blue-500 focus:border-blue-500">
              <option value="All">All Priorities</option>
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Job List */}
          <div className="space-y-3 h-[65vh] overflow-y-auto pr-2">
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => <JobCard key={job.id} job={job} onCloseJob={handleCloseJob} />)
            ) : (
              <div className="text-center py-10 text-slate-400">
                <p className="font-bold">No job cards match your criteria.</p>
                <p className="text-sm">Try adjusting your filters or search term.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}