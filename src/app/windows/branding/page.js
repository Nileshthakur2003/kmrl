'use client';
import { useState } from "react";
import { DollarSign, BarChart2, AlertTriangle, Mail, Check, X } from 'lucide-react';

// (Simulated data for branding campaigns and proposals would be here)
const initialCampaigns = [
    { id: 1, trainsetId: 'TS-05', company: 'Myntra', performance: { actualVisibility: 88.2, required: 85 } },
    { id: 2, trainsetId: 'TS-12', company: 'Lulu', performance: { actualVisibility: 88.9, required: 90 } },
];
const initialProposals = [{ id: 1, company: 'Federal Bank' }];

export default function CommercialDashboard() {
    const [campaigns, setCampaigns] = useState(initialCampaigns);
    const [proposals, setProposals] = useState(initialProposals);

    return (
        <div className="p-8 min-h-screen bg-slate-900 text-white font-sans">
            <header className="mb-8"><h1 className="text-4xl font-bold">Branding & Commercial Dashboard</h1><p className="text-slate-400 mt-1">Manage branding campaigns, revenue, and SLA compliance.</p></header>
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800 p-4 rounded-lg"><p className="text-sm text-slate-400">Monthly Revenue</p><p className="text-2xl font-bold text-green-400">$140,000</p></div>
                <div className="bg-slate-800 p-4 rounded-lg"><p className="text-sm text-slate-400">Active Campaigns</p><p className="text-2xl font-bold text-blue-400">{campaigns.length}</p></div>
                <div className="bg-slate-800 p-4 rounded-lg"><p className="text-sm text-slate-400">SLA Breach Rate</p><p className="text-2xl font-bold text-yellow-400">5.0%</p></div>
                <div className="bg-slate-800 p-4 rounded-lg"><p className="text-sm text-slate-400">Pending Proposals</p><p className="text-2xl font-bold text-purple-400">{proposals.length}</p></div>
            </div>
            <main className="grid grid-cols-3 gap-8">
                <section className="col-span-2 space-y-4"><h2 className="text-2xl font-bold">Active Campaigns</h2><div className="p-4 bg-slate-800 rounded-lg"><p className="font-bold">TS-05 - Myntra</p><p className="text-sm">Visibility: 88.2% / 85.0%</p></div></section>
                <section className="space-y-4"><h2 className="text-2xl font-bold">Proposals</h2><div className="p-3 bg-slate-800 rounded-lg flex justify-between items-center"><p className="font-bold">Federal Bank</p><div className="flex gap-2"><button className="bg-red-600 p-2 rounded-md"><X size={16}/></button><button className="bg-green-600 p-2 rounded-md"><Check size={16}/></button></div></div></section>
            </main>
        </div>
    );
}