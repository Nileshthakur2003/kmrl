'use client';

import { useEffect, useState } from "react";
import { DollarSign, BarChart2, AlertTriangle, Mail, Check, X, Train, Clock, Loader2, ServerCrash } from 'lucide-react';

// --- UI Components ---

const KpiCard = ({ title, value, icon, color }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}/20`}>{icon}</div>
        <div>
            <p className="text-slate-400 text-sm">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

const CampaignCard = ({ campaign }) => {
    const performanceRatio = campaign.performance.currentVisibility / campaign.sla.requiredVisibility;
    let status = 'On Track';
    let progressBarColor = 'bg-green-500';
    let statusColor = 'text-green-400';

    if (performanceRatio < 0.98) {
        status = 'Breached';
        progressBarColor = 'bg-red-500';
        statusColor = 'text-red-400';
    } else if (performanceRatio < 1) {
        status = 'At Risk';
        progressBarColor = 'bg-yellow-500';
        statusColor = 'text-yellow-400';
    }

    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-lg font-bold text-white flex items-center gap-2"><Train size={20}/> {campaign.trainsetId}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <img src={`https://logo.clearbit.com/${campaign.companyName.toLowerCase().replace(/\s+/g, '')}.com`} alt={campaign.companyName} className="w-5 h-5 bg-white rounded-full p-0.5 object-contain" onError={(e) => e.target.src='https://via.placeholder.com/16'} />
                        <span className="text-sm font-semibold">{campaign.companyName}</span>
                    </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${progressBarColor}/20 ${statusColor}`}>{status}</div>
            </div>
            <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Current Visibility</span>
                    <span className="font-bold text-white">{campaign.performance.currentVisibility.toFixed(1)}% / 100%</span>
                </div>
                <div className="relative w-full bg-slate-700 rounded-full h-4">
                    <div className={`${progressBarColor} h-4 rounded-full transition-all duration-500`} style={{width: `${campaign.performance.currentVisibility}%`}}></div>
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-white/80 rounded-full"
                        style={{ left: `${campaign.sla.requiredVisibility}%` }}
                        title={`SLA Target: ${campaign.sla.requiredVisibility}%`}
                    ></div>
                </div>
            </div>
            <div className="text-xs text-slate-400 flex justify-between pt-2 border-t border-slate-700/50">
                <span>Rate: <span className="font-semibold text-slate-200">${campaign.contract.ratePerKm}/km</span></span>
                <span>Ends: <span className="font-semibold text-slate-200">{new Date(campaign.contract.endDate).toLocaleDateString()}</span></span>
            </div>
        </div>
    )
};

// --- Main Dashboard Component ---

export default function BrandingSuperDashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [availableTrainsets, setAvailableTrainsets] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data from the backend
  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await fetch('/api/branding/summary');
            if (!response.ok) throw new Error('Failed to fetch branding data.');
            const result = await response.json();
            if (result.success) {
                setCampaigns(result.data.campaigns);
                setProposals(result.data.proposals);
                setAvailableTrainsets(result.data.availableTrainsets);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();

    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);
  
  // Simulate live visibility updates (frontend only for demo)
  useEffect(() => {
    if (campaigns.length === 0) return;

    const simulationInterval = setInterval(() => {
        const currentHour = new Date().getHours();
        if (currentHour >= 6 && currentHour < 22) { // Only update during operational hours
            setCampaigns(prev => prev.map(c => ({
                ...c,
                performance: {
                    ...c.performance,
                    actualVisibility: Math.min(100, c.performance.currentVisibility + (Math.random() * 0.05))
                }
            })));
        }
    }, 5000); 

    return () => clearInterval(simulationInterval);
  }, [campaigns]); // Re-start simulation if campaigns data changes

  const handleProposal = async (proposalId, action) => {
    // In a real app, these would be API calls to update the backend
    // For now, we simulate the action on the frontend for immediate UI feedback
    if (action === 'Approve') {
        const proposal = proposals.find(p => p._id === proposalId);
        if (!proposal || availableTrainsets.length === 0) return;
        
        // This would be a POST request to '/api/campaigns'
        console.log(`Approving proposal from ${proposal.companyName}...`);

        const newCampaign = { 
            _id: `temp-${Date.now()}`,
            trainsetId: availableTrainsets[0], 
            companyName: proposal.companyName, 
            contract: { ratePerKm: proposal.proposedRatePerKm, endDate: '2026-12-31' },
            sla: { requiredVisibility: 85 }, 
            performance: { actualVisibility: 0 } 
        };
        setCampaigns(prev => [...prev, newCampaign]);
        setAvailableTrainsets(prev => prev.slice(1));
    }
    // This would be a PUT or DELETE request to '/api/proposals/:id'
    setProposals(prev => prev.filter(p => p._id !== proposalId));
  };
  
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.contract.ratePerKm, 0) * 1000;
  const breachCount = campaigns.filter(c => (c.performance.currentVisibility / c.sla.requiredVisibility) < 0.98).length;
  const breachRate = campaigns.length > 0 ? (breachCount / campaigns.length) * 100 : 0;
  const currentHour = currentTime.getHours();
  const isOperational = currentHour >= 6 && currentHour < 22;

  if (isLoading) {
    return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-blue-500"/></div>;
  }

  if (error) {
    return <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-center p-8"><ServerCrash className="w-16 h-16 text-red-500 mb-4"/><h1 className="text-2xl font-bold">Failed to Load Branding Data</h1><p className="text-red-400 mt-2">{error}</p></div>;
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-slate-900 text-white font-sans">
        <header className="mb-8">
            <h1 className="text-4xl font-bold">Branding & Commercial Dashboard</h1>
            <div className="flex items-center gap-4 mt-2">
                 <p className="text-slate-400 flex items-center"><Clock className="w-4 h-4 mr-2"/>{currentTime.toLocaleTimeString('en-IN')}</p>
                 <span className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full ${isOperational ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-300'}`}>
                    <span className={`w-2 h-2 rounded-full ${isOperational ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></span>
                    {isOperational ? 'TRAINS OPERATIONAL' : 'SERVICE HOURS ENDED'}
                 </span>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KpiCard title="Estimated Monthly Revenue" value={`$${(totalRevenue / 12).toLocaleString()}`} icon={<DollarSign/>} color="text-green-400"/>
            <KpiCard title="Active Campaigns" value={campaigns.length} icon={<BarChart2/>} color="text-blue-400"/>
            <KpiCard title="SLA Breach Rate" value={`${breachRate.toFixed(1)}%`} icon={<AlertTriangle/>} color={breachRate > 10 ? "text-red-400" : "text-yellow-400"}/>
            <KpiCard title="Pending Proposals" value={proposals.length} icon={<Mail/>} color="text-purple-400"/>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold border-b-2 border-slate-700 pb-2">Active Campaigns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaigns.map(c => <CampaignCard key={c._id} campaign={c}/>)}
                </div>
            </section>

            <section className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold border-b border-slate-700 pb-2 mb-3">Branding Proposals</h2>
                    <div className="space-y-3">
                        {proposals.map(p => (
                            <div key={p._id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-center">
                                <div><p className="font-bold">{p.companyName}</p><p className="text-xs text-slate-400">${p.proposedRatePerKm}/km | {p.trainsetsRequested} Trainset(s)</p></div>
                                <div className="flex gap-2"><button onClick={() => handleProposal(p._id, 'Reject')} className="bg-red-600/50 hover:bg-red-600 p-2 rounded-md"><X size={16}/></button><button onClick={() => handleProposal(p._id, 'Approve')} className="bg-green-600/50 hover:bg-green-600 p-2 rounded-md"><Check size={16}/></button></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold border-b border-slate-700 pb-2 mb-3">Available Trainsets</h2>
                    <div className="flex flex-wrap gap-2">{availableTrainsets.map(ts => <span key={ts} className="bg-slate-700 px-3 py-1 rounded-full text-sm font-semibold">{ts}</span>)}</div>
                </div>
            </section>
        </main>
    </div>
  );
}
