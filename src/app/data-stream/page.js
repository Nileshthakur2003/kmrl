"use client";

import { useEffect, useState, useMemo } from "react";
import { kmrlDataStreamer, initializeStreamer } from "./kmrl-data-streamer";
import { Thermometer, Droplet, Gauge, Route, ZapOff, Clock, PlayCircle, TestTube2 } from "lucide-react";

// --- Helpers ---
const ProgressBar = ({ value, colorClass }) => (
  <div className="w-full bg-slate-700 rounded-full h-2.5">
    <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
  </div>
);

const getWearColor = (wear) => {
  if (wear < 30) return "bg-green-500";
  if (wear < 70) return "bg-yellow-500";
  return "bg-red-500";
};

// --- Off Hours View ---
const OffHoursView = ({ currentTime, onStartSimulation }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <ZapOff className="w-24 h-24 text-blue-500 mb-6" />
    <h1 className="text-4xl font-bold text-white mb-2">Service Monitoring is Offline</h1>
    <p className="text-lg text-slate-400 max-w-lg">
      Live trainset monitoring is active during operational hours (6:00 AM - 10:00 PM). You can run a simulation.
    </p>
    <p className="text-md text-slate-500 mt-4 mb-6 flex items-center">
      <Clock className="w-4 h-4 mr-2" /> Current Time: {currentTime.toLocaleTimeString("en-IN", { hour12: false })}
    </p>
    <button onClick={onStartSimulation} className="flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50">
      <PlayCircle className="w-5 h-5 mr-2" /> Run Simulation
    </button>
  </div>
);

// --- Simulation Banner ---
const SimulationBanner = ({ onExit }) => (
  <div className="bg-purple-600/30 border border-purple-500 text-white p-3 rounded-lg mb-6 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
    <div className="flex items-center mb-2 sm:mb-0">
      <TestTube2 className="w-5 h-5 mr-3 text-purple-300 animate-pulse" />
      <p className="font-bold">SIMULATION MODE ACTIVE</p>
      <p className="text-sm text-purple-300 ml-2 hidden lg:block">Displaying generated sample data.</p>
    </div>
    <button onClick={onExit} className="bg-purple-600 hover:bg-purple-700 text-xs font-bold py-1 px-3 rounded-md transition-colors">Exit Simulation</button>
  </div>
);

// --- Aggregate Trainset Data ---
const aggregateTrainsetData = (iotData) => {
  if (!iotData || !iotData.length) return [];
  const trainsets = {};

  iotData.forEach((car) => {
    if (!trainsets[car.trainsetId]) {
      trainsets[car.trainsetId] = {
        id: car.trainsetId,
        cars: [],
        totalKmRun: 0,
        totalTemp: 0,
        totalHumidity: 0,
        totalBrakeWear: 0,
        totalWheelWear: 0,
        statuses: [],
      };
    }
    trainsets[car.trainsetId].cars.push(car);
  });

  return Object.values(trainsets).map((ts) => {
    const carCount = ts.cars.length;
    let overallStatus = "running";

    ts.cars.forEach((car) => {
      ts.totalKmRun += car.kmRun;
      ts.totalTemp += car.hvac.temperature;
      ts.totalHumidity += car.hvac.humidity;
      ts.totalBrakeWear += car.wearAndTear.brakeCondition;
      ts.totalWheelWear += car.wearAndTear.wheelCondition;
      ts.statuses.push(car.status);
    });

    if (ts.statuses.includes("maintenance")) overallStatus = "maintenance";
    else if (ts.statuses.includes("idle")) overallStatus = "idle";

    return {
      ...ts,
      overallStatus,
      avgTemp: carCount > 0 ? ts.totalTemp / carCount : 0,
      avgHumidity: carCount > 0 ? ts.totalHumidity / carCount : 0,
      avgBrakeWear: carCount > 0 ? ts.totalBrakeWear / carCount : 0,
      avgWheelWear: carCount > 0 ? ts.totalWheelWear / carCount : 0,
    };
  });
};

// --- Trainset Card ---
const TrainsetCard = ({ trainset }) => {
  const statusStyles = {
    running: { bg: "bg-green-600/20", text: "text-green-400", border: "border-green-500" },
    idle: { bg: "bg-yellow-600/20", text: "text-yellow-400", border: "border-yellow-500" },
    maintenance: { bg: "bg-red-600/20", text: "text-red-400", border: "border-red-500" },
  };
  const currentStatus = statusStyles[trainset.overallStatus];

  return (
    <div className={`bg-slate-800/50 p-6 rounded-lg border ${currentStatus.border} transition-all`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">🚈 Trainset {trainset.id}</h2>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
          {trainset.overallStatus.toUpperCase()}
        </span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Thermometer className="w-5 h-5 text-blue-400" />
            <span>Avg. Temp: <strong>{trainset.avgTemp.toFixed(1)}°C</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplet className="w-5 h-5 text-cyan-400" />
            <span>Avg. Humidity: <strong>{trainset.avgHumidity.toFixed(1)}%</strong></span>
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2 text-sm mb-1">
            <Gauge className="w-5 h-5 text-orange-400" />
            <span>Avg. Brake Wear: <strong>{trainset.avgBrakeWear.toFixed(1)}%</strong></span>
          </div>
          <ProgressBar value={trainset.avgBrakeWear} colorClass={getWearColor(trainset.avgBrakeWear)} />
        </div>

        <div>
          <div className="flex items-center space-x-2 text-sm mb-1">
            <Gauge className="w-5 h-5 text-orange-400" />
            <span>Avg. Wheel Wear: <strong>{trainset.avgWheelWear.toFixed(1)}%</strong></span>
          </div>
          <ProgressBar value={trainset.avgWheelWear} colorClass={getWearColor(trainset.avgWheelWear)} />
        </div>

        <div className="flex items-center space-x-2 pt-2 border-t border-slate-700">
          <Route className="w-5 h-5 text-purple-400" />
          <span>Total KM Run: <strong>{Math.floor(trainset.totalKmRun).toLocaleString()} km</strong></span>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2">Car Status</h4>
          <div className="flex space-x-2">
            {trainset.cars.map((car) => (
              <div
                key={`${trainset.id}-${car.carId}`}
                className={`w-full h-2 rounded-full ${statusStyles[car.status]?.bg?.replace("/20", "/80")}`}
                title={`Car ${car.carId}: ${car.status}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function Datastream() {
  const [iotData, setIotData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSimulating, setIsSimulating] = useState(false);

  const operationalStartHour = 6;
  const operationalEndHour = 22;
  const currentHour = currentTime.getHours();
  const isOperationalHours = currentHour >= operationalStartHour && currentHour < operationalEndHour;

  // Initialize streamer once
  useEffect(() => {
    async function initStreamer() {
      try {
        const res = await fetch("/api/trainset/get-create");
        if (!res.ok) return console.error("Failed to fetch trainsets");

        const trainsets = await res.json();
        const trainsetArray = Array.isArray(trainsets.data) ? trainsets.data : [];
        if (!trainsetArray.length) return console.warn("No trainsets available");

        initializeStreamer(trainsetArray);
        kmrlDataStreamer.startStreaming((cars) => setIotData(cars), null, 2000, 60000);
      } catch (err) {
        console.error("Error initializing streamer:", err);
      }
    }

    initStreamer();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { kmrlDataStreamer.stopStreaming(); clearInterval(timer); };
  }, []);

  // Aggregate data with useMemo to avoid infinite re-renders
  const aggregatedData = useMemo(() => aggregateTrainsetData(iotData), [iotData]);

  const showDataView = isOperationalHours || isSimulating;

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight">🚇 KMRL Trainset Operations</h1>
          <p className="text-slate-400 mt-1">Live aggregated data from active trainsets</p>
        </header>

        {showDataView ? (
          <>
            {isSimulating && <SimulationBanner onExit={() => setIsSimulating(false)} />}
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {aggregatedData.map((trainset) => (
                <TrainsetCard key={trainset.id} trainset={trainset} />
              ))}
            </div>
          </>
        ) : (
          <OffHoursView currentTime={currentTime} onStartSimulation={() => setIsSimulating(true)} />
        )}
      </div>
    </div>
  );
}
