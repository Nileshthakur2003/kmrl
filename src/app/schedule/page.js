'use client';

import { useState, useEffect } from 'react';
import {
  FileText, CheckCircle, Loader2, BrainCircuit, Bot, ChevronsRight, BarChart3, Wind, Users, Wrench,
  CalendarDays, Clock, ShipWheel, Droplets, SprayCan, AlertCircle, ShieldCheck, Info, Zap
} from 'lucide-react';

// --- Reusable Components ---

const Header = () => {
  // Initial time set to 2025-10-06T22:18:00 IST
  const [currentTime, setCurrentTime] = useState(new Date("2025-10-06T22:18:00"));

  useEffect(() => {
    // Increment time by 1 second every 1000ms
    const timer = setInterval(() => setCurrentTime(prevTime => new Date(prevTime.getTime() + 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center">
          <ShipWheel className="mr-3 h-8 w-8 text-blue-400" />
          Nightly Induction Planner
        </h1>
        <p className="text-slate-400 mt-2">Decision-support simulation for next-day operations.</p>
      </div>
      <div className="text-right mt-4 sm:mt-0">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1 inline-block">
            <p className="text-lg text-yellow-300 flex items-center justify-end font-mono">
              <Clock className="w-4 h-4 mr-2" />
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
            </p>
            <p className="text-sm text-slate-400 flex items-center justify-end">
              <CalendarDays className="w-4 h-4 mr-2" />
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
        </div>
      </div>
    </header>
  );
};

const StepIndicator = ({ currentStep }) => {
  const steps = ["Data Ingestion", "Allocation", "Conflicts", "Optimization", "Final Plan"];

  return (
    <div className="flex justify-center items-center my-10">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center" style={{minWidth: '80px'}}>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                index + 1 <= currentStep ? 'bg-blue-600 border-blue-400' : 'bg-slate-700 border-slate-600'
              }`}
            >
              {index + 1 < currentStep ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <span className={`font-bold text-lg ${index + 1 <= currentStep ? 'text-white' : 'text-slate-400'}`}>
                  {index + 1}
                </span>
              )}
            </div>
            <p className={`mt-2 text-xs text-center font-semibold transition-colors duration-500 ${index + 1 <= currentStep ? 'text-blue-300' : 'text-slate-500'}`}>
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-auto h-1 mx-2 transition-colors duration-500 ${index + 1 < currentStep ? 'bg-blue-500' : 'bg-slate-700'}`} style={{minWidth: '40px'}}></div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- NEW Component for Pre-Simulation State ---

const PreSimulationLanding = () => {
  const coreFunctions = [
    { icon: <ShieldCheck className="w-6 h-6 text-green-400" />, title: "Compliance Check", desc: "Validate all safety and regulatory fitness certificates." },
    { icon: <Wrench className="w-6 h-6 text-red-400" />, title: "Maintenance Prioritization", desc: "Schedule trains for mandatory and preventative upkeep." },
    { icon: <Wind className="w-6 h-6 text-teal-400" />, title: "Resource Optimization", desc: "Minimize shunting movements and balance mileage distribution." },
    { icon: <BrainCircuit className="w-6 h-6 text-purple-400" />, title: "Conflict Resolution", desc: "Identify and suggest fixes for incompatible schedule claims." },
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 md:p-12 animate-fade-in text-center">
      <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4"/>
      <h2 className="text-3xl font-extrabold text-white mb-4">Ready to Plan Tomorrow\'s Fleet?</h2>
      <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
        The Nightly Induction Planner uses a multi-objective optimization engine to generate the most efficient and compliant train service schedule for the next operating day.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {coreFunctions.map((func, index) => (
          <div key={index} className="flex flex-col items-center bg-slate-800 p-5 rounded-lg border border-slate-700 transition-shadow hover:shadow-lg hover:shadow-blue-500/20">
            <div className="mb-3">{func.icon}</div>
            <h4 className="font-bold text-blue-300 mb-2">{func.title}</h4>
            <p className="text-sm text-slate-400">{func.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500 mt-8">Click 'Begin Simulation\' to start the 5-step process.</p>
    </div>
  );
};

// --- Simulation Step Components (No Changes) ---

const DataIngestionPanel = ({ isProcessing }) => {
    const dataSources = [
      { name: "Fitness Certificates", icon: <ShieldCheck className="text-green-400" /> },
      { name: "Job-Cards (Maximo)", icon: <FileText className="text-red-400" /> },
      { name: "Branding SLAs", icon: <SprayCan className="text-purple-400" /> },
      { name: "Mileage Data", icon: <BarChart3 className="text-yellow-400" /> },
      { name: "Cleaning Slots", icon: <Droplets className="text-blue-400" /> },
      { name: "Stabling Geometry", icon: <ChevronsRight className="text-teal-400" /> },
    ];

    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 animate-fade-in">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">Step 1: Ingesting Heterogeneous Data</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dataSources.map(source => (
                  <div key={source.name} className="bg-slate-800 p-4 rounded-lg text-center flex flex-col items-center justify-center border border-slate-600">
                      <div className="w-12 h-12 flex items-center justify-center">{source.icon}</div>
                      <p className="text-xs font-medium text-slate-300 my-2 h-8">{source.name}</p>
                      {isProcessing ? (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                  </div>
              ))}
          </div>
      </div>
    );
};

const TrainAllocationPanel = ({ isProcessing }) => {
    const mockTrains = {
        service: ['T01', 'T04', 'T05', 'T08', 'T12', 'T15', 'T18', 'T21', 'T22', 'T24'],
        standby: ['T03', 'T11', 'T16'],
        maintenance: ['T07', 'T19', 'T25']
    };

    const renderTrainList = (trains) => (
        <div className="flex flex-wrap gap-2 justify-center">
            {trains.map(t => (
                <span key={t} className="bg-slate-700 text-slate-200 text-sm font-mono py-1 px-3 rounded-md animate-pop-in">
                    {t}
                </span>
            ))}
        </div>
    );

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Step 2: Rule-Based Initial Allocation</h3>
            {isProcessing ? (
                <div className="flex justify-center items-center p-8">
                       <Loader2 className="w-8 h-8 text-blue-500 animate-spin mr-3" />
                       <p className="text-slate-400">Applying initial constraints from ingested data...</p>
                </div>
            ) : (
                   <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <h4 className="font-bold text-green-300 text-center mb-3">Fit for Service ({mockTrains.service.length})</h4>
                          {renderTrainList(mockTrains.service)}
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                          <h4 className="font-bold text-yellow-300 text-center mb-3">Candidates for Standby ({mockTrains.standby.length})</h4>
                          {renderTrainList(mockTrains.standby)}
                      </div>
                       <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                          <h4 className="font-bold text-red-300 text-center mb-3">Flagged for Maintenance ({mockTrains.maintenance.length})</h4>
                          {renderTrainList(mockTrains.maintenance)}
                      </div>
                  </div>
            )}
        </div>
    );
};

const ConflictResolutionPanel = ({ conflicts, resolveConflict, resolvedConflicts }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Step 3: Conflict Identification & Resolution</h3>
            <div className="space-y-4">
                {conflicts.map(conflict => (
                    <div key={conflict.id} className={`p-4 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${resolvedConflicts[conflict.id] ? 'bg-slate-800 border-slate-700 opacity-60' : 'bg-yellow-900/40 border-yellow-500/30'}`}>
                        <div className="flex items-start">
                           <AlertCircle className="w-8 h-8 text-yellow-400 mr-4 flex-shrink-0 mt-1" />
                           <div>
                                 <h4 className="font-bold text-white">Trainset {conflict.trainset}</h4>
                                 <p className="text-sm text-yellow-200">{conflict.description}</p>
                                 <p className="text-xs text-slate-400 mt-1">System Recommendation: {conflict.recommendation}</p>
                           </div>
                        </div>
                        <div className="flex gap-2 self-end md:self-center flex-shrink-0">
                            {resolvedConflicts[conflict.id] ? (
                                <span className="text-sm text-green-400 font-semibold flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2"/> Resolved
                                </span>
                            ) : (
                                <>
                                    <button onClick={() => resolveConflict(conflict.id, 'accept')} className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-md">Accept Rec.</button>
                                    <button onClick={() => resolveConflict(conflict.id, 'override')} className="text-xs bg-slate-600 hover:bg-slate-700 text-white font-semibold py-1 px-3 rounded-md">Override</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const OptimizationEnginePanel = ({ isProcessing }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-6 text-center">Step 4: Multi-Objective Optimization</h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                <div className="flex flex-col gap-4 text-center items-center">
                    <div className="flex items-center justify-center bg-slate-700/50 p-4 rounded-lg w-64">
                        <Bot className="w-8 h-8 text-blue-400 mr-4"/>
                        <div>
                           <h4 className="font-semibold text-white">MILP Algorithm</h4>
                           <p className="text-sm text-slate-400">Constraint-based planning</p>
                        </div>
                    </div>
                     <div className="flex items-center justify-center bg-slate-700/50 p-4 rounded-lg w-64">
                        <BrainCircuit className="w-8 h-8 text-purple-400 mr-4"/>
                           <div>
                           <h4 className="font-semibold text-white">AI/ML Forecasting</h4>
                           <p className="text-sm text-slate-400">Historical outcome analysis</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">{isProcessing ? <Loader2 className="w-16 h-16 text-blue-500 animate-spin"/> : <CheckCircle className="w-16 h-16 text-green-500"/>}</div>

                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-semibold text-slate-300 mb-3 text-center">Balancing Objectives</h4>
                       <ul className="space-y-2">
                          <li className="flex items-center text-sm text-slate-300"><ChevronsRight className="w-4 h-4 mr-2 text-slate-500"/>Equalize Train Mileage</li>
                          <li className="flex items-center text-sm text-slate-300"><Wind className="w-4 h-4 mr-2 text-teal-400"/>Minimize Shunting & Energy</li>
                          <li className="flex items-center text-sm text-slate-300"><Users className="w-4 h-4 mr-2 text-orange-400"/>Adhere to Crew Schedules</li>
                          <li className="flex items-center text-sm text-slate-300"><Wrench className="w-4 h-4 mr-2 text-red-400"/>Respect Maintenance Windows</li>
                      </ul>
                </div>
            </div>
            {isProcessing && <div className="w-full bg-slate-700 rounded-full h-2.5 mt-8"><div className="bg-blue-600 h-2.5 rounded-full animate-progress"></div></div>}
        </div>
    );
};


const FinalSchedulePanel = () => {
  const finalPlan = [
  // 16 Service
  { trainset: 'T01', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T04', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T06', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T08', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T09', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T10', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T11', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T12', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T13', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T14', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T15', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T16', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T17', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T18', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T20', status: 'Service', reason: 'Fit for service', risk: 'Low' },
  { trainset: 'T21', status: 'Service', reason: 'Fit for service', risk: 'Low' },

  // 6 Standby
  { trainset: 'T03', status: 'Standby', reason: 'Mileage nearing threshold', risk: 'Low' },
  { trainset: 'T05', status: 'Standby', reason: 'Pending job-card review', risk: 'Medium' },
  { trainset: 'T22', status: 'Standby', reason: 'Awaiting branding clearance', risk: 'Medium' },
  { trainset: 'T23', status: 'Standby', reason: 'Depot rotation delay', risk: 'Low' },
  { trainset: 'T26', status: 'Standby', reason: 'Supervisor hold for reassignment', risk: 'Low' },
  { trainset: 'T27', status: 'Standby', reason: 'Awaiting minor inspection slot', risk: 'Low' },

  // 5 Maintenance (Updated from original 3 + T24, T25 for conflict resolution)
  { trainset: 'T02', status: 'Maintenance', reason: 'Scheduled overhaul (RUL < 30 days)', risk: 'N/A' },
  { trainset: 'T07', status: 'Maintenance', reason: 'Brake pad replacement (Job-Card #JC7891)', risk: 'N/A' },
  { trainset: 'T19', status: 'Maintenance', reason: 'Telecom fitness cert expired', risk: 'N/A' },
  { trainset: 'T24', status: 'Maintenance', reason: 'Wheelset anomaly detected during inspection', risk: 'N/A' },
  { trainset: 'T25', status: 'Maintenance', reason: 'Conflict resolution override (branding SLA postponed)', risk: 'N/A' } // T25 updated reason to reflect a potential conflict outcome
];

  const getStatusClass = (status) => {
    if (status === 'Service') return 'bg-green-500/10 text-green-300';
    if (status === 'Standby') return 'bg-yellow-500/10 text-yellow-300';
    return 'bg-red-500/10 text-red-300';
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 animate-fade-in">
      <h3 className="text-xl font-semibold text-white mb-2 text-center">Step 5: Generated Induction Plan with Explainable Reasoning</h3>
       <div className="overflow-x-auto">
          <table className="w-full text-left mt-6">
             <thead className="text-xs text-slate-400 uppercase">
                 <tr>
                      <th className="p-3">Trainset</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Primary Reason (Explainable AI)</th>
                      <th className="p-3"></th>
                 </tr>
             </thead>
             <tbody className="divide-y divide-slate-700">
                 {finalPlan.map(item => (
                      <tr key={item.trainset} className="hover:bg-slate-800 cursor-pointer group">
                          <td className="p-3 font-mono text-white">{item.trainset}</td>
                          <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(item.status)}`}>{item.status}</span></td>
                          <td className="p-3 text-slate-300 text-sm">{item.reason}</td>
                          <td className="p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="text-xs text-blue-300 flex items-center hover:underline"><Info className="w-3 h-3 mr-1"/> What if?</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
       </div>
    </div>
  );
};


// --- Main Page Component ---

export default function InductionPlannerPage() {
    const [step, setStep] = useState(0); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [conflicts, setConflicts] = useState([]);
    const [resolvedConflicts, setResolvedConflicts] = useState({});
    const maxSteps = 5;
    
    const handleNextStep = () => {
        if (step >= maxSteps) return;
        
        setIsProcessing(true);
        const nextStep = step + 1;
        
        if (nextStep === 3) { // After Allocation, generate conflicts
              const mockConflicts = [
                 { id: 1, trainset: 'T25', description: 'High-priority branding SLA requires service, but a non-critical job-card for HVAC is open. This is a claim conflict.', recommendation: 'Prioritize branding SLA.'},
                 { id: 2, trainset: 'T11', description: 'Signalling fitness certificate expires in 26 hours. Can run one more day but is a high safety risk.', recommendation: 'Move to Standby.'},
             ];
             setConflicts(mockConflicts);
        }

        // This timeout is for the transition animation between steps.
        setTimeout(() => {
            setStep(nextStep);

            if (nextStep === 2) {
                // Step 2 (Allocation) shows processing for 2 seconds.
                setTimeout(() => setIsProcessing(false), 2000);
            } else if (nextStep === 4) {
                // Step 4 (Optimization) shows its progress bar animation for 1.5s.
                setTimeout(() => setIsProcessing(false), 1500);
            } else {
                // Step 1 (Ingestion), Step 3 (Conflicts), and Step 5 (Final), end immediately.
                setIsProcessing(false);
            }
        }, 1500); 
    };
    
    const resolveConflict = (id, action) => {
        setResolvedConflicts(prev => ({...prev, [id]: action }));
    }

    const handleReset = () => {
      setStep(0);
      setIsProcessing(false);
      setConflicts([]);
      setResolvedConflicts({});
    }

    const renderCurrentStep = () => {
        switch (step) {
            case 0: return <PreSimulationLanding />;
            case 1: return <DataIngestionPanel isProcessing={isProcessing} />;
            case 2: return <TrainAllocationPanel isProcessing={isProcessing} />;
            case 3: return <ConflictResolutionPanel conflicts={conflicts} resolveConflict={resolveConflict} resolvedConflicts={resolvedConflicts}/>;
            case 4: return <OptimizationEnginePanel isProcessing={isProcessing} />;
            case 5: return <FinalSchedulePanel />;
            default: return null;
        }
    };

    // Check if all conflicts in step 3 are resolved
    const allConflictsResolved = conflicts.length > 0 && Object.keys(resolvedConflicts).length === conflicts.length;
    const isNextButtonDisabled = isProcessing || (step === 3 && !allConflictsResolved);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
            <style jsx global>{`
              @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
              .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
              @keyframes pop-in { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
              .animate-pop-in { animation: pop-in 0.3s ease-out forwards; }
              @keyframes progress { from { width: 0%; } to { width: 100%; } }
              .animate-progress { animation: progress 1.5s ease-in-out forwards; }
            `}</style>
            <div className="max-w-7xl mx-auto">
                <Header />
                <main>
                    {step > 0 && <StepIndicator currentStep={step} />}
                    <div className="my-8 min-h-[350px]">{renderCurrentStep()}</div>
                    <div className="flex justify-center mt-12">
                        {step === 0 && (
                            <button onClick={handleNextStep} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 text-lg transform hover:scale-105">Begin Simulation</button>
                        )}
                        {step > 0 && step < maxSteps && (
                            <button onClick={handleNextStep} disabled={isNextButtonDisabled} className="bg-slate-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-500 transition-colors duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center">
                               {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Processing...</> : "Next Step"}
                            </button>
                        )}
                        {step === maxSteps && (
                            <button onClick={handleReset} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-500 transition-colors duration-300">Run Simulation Again</button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}