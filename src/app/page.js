'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle,
  PauseCircle,
  AlertTriangle,
  ChevronRight,
  Clock,
  CalendarDays,
  Loader2,
  Play,
} from 'lucide-react';

// ============================
// Header Component
// ============================
const Header = ({ profile, currentTime }) => (
  <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center">
    <div>
      <h1 className="text-3xl font-bold text-white">KMRL Operations Hub</h1>
      <p className="text-slate-400 mt-2 flex flex-wrap items-center gap-4">
        <span className="flex items-center">
          <CalendarDays className="w-4 h-4 mr-2" />
          {currentTime.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <span className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          {currentTime.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </span>
      </p>
    </div>

    <div className="flex items-center space-x-4 bg-slate-800/50 border border-slate-700 rounded-lg p-2 mt-4 sm:mt-0">
      <img
        src={profile?.avatarUrl}
        alt={profile?.name}
        className="w-10 h-10 rounded-full bg-slate-700"
      />
      <div>
        <p className="font-semibold text-sm text-white">
          {profile?.name ?? 'Loading...'}
        </p>
        <p className="text-xs text-slate-400">{profile?.role ?? '...'}</p>
      </div>
    </div>
  </header>
);

// ============================
// Scheduling Planner
// ============================
const SchedulingPlanner = ({ currentTime }) => {
  const hour = currentTime.getHours();
  const isWindowOpen = hour >= 21 && hour < 23;
  const isAfterWindow = hour >= 23 || hour < 6;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8 text-center">
      <h2 className="text-xl font-semibold text-white mb-3">
        Nightly Induction Planner
      </h2>

      {isWindowOpen ? (
        <p className="text-yellow-400 text-lg mb-4 font-semibold">
          Live Scheduling Window Open (9:00 PM – 11:00 PM)
        </p>
      ) : isAfterWindow ? (
        <p className="text-green-400 text-lg mb-4 font-semibold">
          Planning Complete — Induction list generated for today's operation.
        </p>
      ) : (
        <p className="text-blue-400 text-lg mb-4 font-semibold">
          Next Scheduling opens at 9:00 PM
        </p>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
        <Link
          href="/schedule"
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
        >
          Simulate Planning
        </Link>
      </div>
    </div>
  );
};

// ============================
// Stat Card
// ============================
const StatCard = ({ title, link, icon, value, color }) => (
  <Link
    href={link}
    className="group relative bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-all duration-300"
  >
    <div className="flex items-center space-x-4">
      <div className="bg-slate-700/50 p-3 rounded-md">{icon}</div>
      <div>
        <h3 className="text-slate-400 font-medium">{title}</h3>
        <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-blue-500" />
      </div>
    </div>
  </Link>
);

// ============================
// Fleet Overview
// ============================
const FleetStatusCard = ({
  title,
  count,
  icon,
  color,
  trainsets,
  expanded,
  onClick,
}) => (
  <div className="flex flex-col">
    <div
      onClick={onClick}
      className={`p-4 rounded-md text-center cursor-pointer transition-all duration-300 ${color.bg} ${color.border} hover:border-slate-400`}
    >
      {icon}
      <p className="text-3xl font-bold text-white">{count ?? '...'}</p>
      <p className={`text-sm font-medium ${color.text}`}>{title}</p>
    </div>

    {expanded && (
      <div className="mt-2 p-3 bg-slate-900/70 border border-slate-700 rounded-b-md">
        <h4 className="font-semibold text-slate-300 text-xs mb-2 text-center">
          Trainsets
        </h4>
        {trainsets?.length ? (
          <div className="flex flex-wrap justify-center gap-2">
            {trainsets.map((ts) => (
              <span
                key={ts}
                className="bg-slate-700 text-slate-300 text-xs font-mono py-1 px-2 rounded"
              >
                {ts}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-xs text-center">
            No trainsets in this state.
          </p>
        )}
      </div>
    )}
  </div>
);

const FleetOverview = ({ status }) => {
  const [expanded, setExpanded] = useState(null);
  const toggle = (key) => setExpanded((prev) => (prev === key ? null : key));

  const categories = [
    {
      key: 'ready',
      title: 'Ready for Service',
      count: status?.ready,
      trainsets: status?.readyTrainsets,
      icon: <CheckCircle className="mx-auto text-green-400 mb-2 h-8 w-8" />,
      color: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'text-green-400',
      },
    },
    {
      key: 'standby',
      title: 'On Standby',
      count: status?.standby,
      trainsets: status?.standbyTrainsets,
      icon: <PauseCircle className="mx-auto text-yellow-400 mb-2 h-8 w-8" />,
      color: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
      },
    },
    {
      key: 'ibl',
      title: 'IBL / Maintenance',
      count: status?.ibl,
      trainsets: status?.iblTrainsets,
      icon: <AlertTriangle className="mx-auto text-red-400 mb-2 h-8 w-8" />,
      color: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
      },
    },
  ];

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">
        Fleet Status Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <FleetStatusCard
            key={cat.key}
            {...cat}
            expanded={expanded === cat.key}
            onClick={() => toggle(cat.key)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================
// Alerts Panel
// ============================
const AlertsPanel = ({ alerts }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
      <Bell className="mr-2 text-yellow-400" /> Urgent Alerts
    </h2>
    <div className="space-y-3">
      {alerts?.length ? (
        alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-start space-x-3 bg-slate-800 p-3 rounded-md"
          >
            <AlertTriangle className={`w-5 h-5 mt-1 ${a.color}`} />
            <div>
              <p className="font-semibold text-white">
                {a.trainsetId}:{' '}
                <span className="font-normal">{a.message}</span>
              </p>
              <p className="text-xs text-slate-400">{a.timestamp}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-slate-400">No urgent alerts at this time.</p>
      )}
    </div>
  </div>
);

// ============================
// Main Dashboard Component
// ============================
export default function KMRLMaintenanceDashboard() {
  const [currentTime, setCurrentTime] = useState(
    new Date('2025-10-06T22:44:21')
  );

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentTime((prev) => new Date(prev.getTime() + 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  const profile = {
    name: 'Alok Varma',
    role: 'Operations Manager',
    avatarUrl: '/avatar-placeholder.png',
  };

  const data = {
    fleetStatus: {
      total: 25,
      ready: 18,
      standby: 4,
      ibl: 3,
      readyTrainsets: [
        'T01',
        'T02',
        'T05',
        'T07',
        'T09',
        'T10',
        'T11',
        'T12',
        'T13',
        'T14',
        'T16',
        'T17',
        'T18',
        'T20',
        'T21',
        'T22',
        'T23',
        'T24',
      ],
      standbyTrainsets: ['T03', 'T06', 'T15', 'T19'],
      iblTrainsets: ['T04', 'T08', 'T25'],
    },
    jobCardStats: '14 Active (3 Critical)',
    brandingSlaStats: '95% Compliance',
    urgentAlerts: [
      {
        id: 1,
        trainsetId: 'T08',
        message: 'Wheelset temperature high anomaly (Critical)',
        timestamp: '10:35 PM',
        color: 'text-red-500',
      },
      {
        id: 2,
        trainsetId: 'T03',
        message: 'Signalling certificate expiring in 48 hours (High)',
        timestamp: '09:15 PM',
        color: 'text-yellow-500',
      },
    ],
  };

  const mainStats = [
    {
      title: 'IoT Data Stream',
      link: '/data-stream',
      icon: <span role="img" aria-label="train">🚇</span>,
      value: 'All Systems Nominal',
      color: 'text-green-400',
    },
    {
      title: 'Open Job Cards',
      link: '/job-cards',
      icon: <span role="img" aria-label="wrench">🛠️</span>,
      value: data.jobCardStats,
      color: 'text-yellow-400',
    },
    {
      title: 'Cleaning Bay Status',
      link: '/cleaning-bay',
      icon: <span role="img" aria-label="broom">🧹</span>,
      value: '4 / 6 Bays Available',
      color: 'text-blue-400',
    },
    {
      title: 'Branding SLAs',
      link: '/branding',
      icon: <span role="img" aria-label="chart">📊</span>,
      value: data.brandingSlaStats,
      color: 'text-green-400',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Header profile={profile} currentTime={currentTime} />
        <main>
          <SchedulingPlanner currentTime={currentTime} />
          <FleetOverview status={data.fleetStatus} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {mainStats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>
          <AlertsPanel alerts={data.urgentAlerts} />
        </main>
      </div>
    </div>
  );
}
