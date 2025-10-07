'use client';

import { useEffect, useState, useMemo } from "react";
import { Train, Wrench, Wind, AlertTriangle, List, BarChart, HardDrive, Shuffle, Loader2, ServerCrash } from 'lucide-react';

// --- Configuration & Data Simulation ---

const DEPOT_LAYOUT = {
    stabling: { count: 5, slots: 2, label: 'Stabling Line' },
    maintenance: { count: 3, slots: 1, label: 'Maintenance Bay' },
    wash: { count: 1, slots: 1, label: 'Wash Line' },
};

const STATUS_COLORS = {
    'Ready': 'fill-blue-500',
    'Standby': 'fill-cyan-500',
    'Awaiting Cleaning': 'fill-yellow-500',
    'Under Repair': 'fill-red-500',
    'Washing': 'fill-teal-500',
    'In Service': 'fill-green-500', // Added color for In Service
};

// --- Main Dashboard Component ---

export default function DepotCommandCenter() {
    const USER_ROLE = 'admin';

    const [allTrainsets, setAllTrainsets] = useState([]);
    const [selectedTrain, setSelectedTrain] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [draggedTrain, setDraggedTrain] = useState(null);

    // --- NEW: State for loading and error handling ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // The user specified 'get-create'. The standard RESTful endpoint is typically just the resource name.
                // We will fetch from '/api/trainsets'
                const response = await fetch('/api/trainset/get-create');
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                if (result.success) {
                    setAllTrainsets(result.data);
                    // Generate alerts based on fetched data
                    const newAlerts = result.data
                        .filter(t => t.health.componentWear.brakes > 70 || t.health.componentWear.wheels > 70)
                        .map((t) => ({
                            id: t._id, // Use actual ID for key
                            trainsetId: t._id,
                            message: `Component wear critical. Brake: ${t.health.componentWear.brakes}%, Wheel: ${t.health.componentWear.wheels}%`,
                            level: 'high'
                        }));
                    setAlerts(newAlerts);
                } else {
                    throw new Error(result.error || 'Failed to fetch trainsets.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Filter trains for depot map vs. in-service list ---
    const { depotTrains, inServiceTrains } = useMemo(() => {
        const depot = [];
        const inService = [];
        allTrainsets.forEach(t => {
            if (t.currentStatus === 'In Service') {
                inService.push(t);
            } else {
                depot.push(t);
            }
        });
        // FIX: The internal variable names must be different from the destructured ones.
        return { depotTrains: depot, inServiceTrains: inService };
    }, [allTrainsets]);


    const handleArrangeForService = () => {
        let stabledTrains = allTrainsets.filter(t => t.location.type === 'stabling');
        let otherTrains = allTrainsets.filter(t => t.location.type !== 'stabling');

        stabledTrains.sort((a, b) => {
            if (a.currentStatus === 'Ready' && b.currentStatus !== 'Ready') return -1;
            if (a.currentStatus !== 'Ready' && b.currentStatus === 'Ready') return 1;
            if (a.currentStatus === 'Standby' && b.currentStatus !== 'Standby') return -1;
            if (a.currentStatus !== 'Standby' && b.currentStatus === 'Standby') return 1;
            return 0;
        });
        
        let line = 1, slot = 1;
        stabledTrains.forEach(train => {
            train.location = { type: 'stabling', line, slot };
            if (slot >= DEPOT_LAYOUT.stabling.slots) {
                slot = 1;
                line++;
            } else {
                slot++;
            }
        });

        setAllTrainsets([...otherTrains, ...stabledTrains]);
        setSelectedTrain(null);
    };

    const fleetStatus = useMemo(() => {
        const status = { stabled: 0, maintenance: 0, washing: 0, ready: 0, standby: 0, inService: 0, total: allTrainsets.length };
        allTrainsets.forEach(t => {
            if (t.currentStatus === 'In Service') status.inService++;
            else if (t.location?.type === 'stabling') status.stabled++;
            else if (t.location?.type === 'maintenance') status.maintenance++;
            else if (t.location?.type === 'wash') status.washing++;
            
            if (t.currentStatus === 'Ready') status.ready++;
            if (t.currentStatus === 'Standby') status.standby++;
        });
        return status;
    }, [allTrainsets]);


    const handleMouseDown = (e, trainId) => {
        setSelectedTrain(allTrainsets.find(t => t._id === trainId));
        if (USER_ROLE !== 'admin') return;
        const train = allTrainsets.find(t => t._id === trainId);
        if (train) {
            setDraggedTrain({
                id: train._id,
                offsetX: e.clientX - e.currentTarget.getBoundingClientRect().left,
                offsetY: e.clientY - e.currentTarget.getBoundingClientRect().top,
            });
        }
    };

    const handleMouseMove = (e) => {
        if (!draggedTrain) return;
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        setAllTrainsets(prev => prev.map(t => t._id === draggedTrain.id ? { ...t, isDragging: true, dragX: svgP.x - draggedTrain.offsetX, dragY: svgP.y - draggedTrain.offsetY } : t));
    };

    const handleMouseUp = async (e) => {
        if (!draggedTrain) return;
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
        let droppedOn = null;
        const lineConfig = [
            { type: 'stabling', ...DEPOT_LAYOUT.stabling },
            { type: 'maintenance', ...DEPOT_LAYOUT.maintenance, yOffset: DEPOT_LAYOUT.stabling.count * 40 + 30 },
            { type: 'wash', ...DEPOT_LAYOUT.wash, yOffset: (DEPOT_LAYOUT.stabling.count + DEPOT_LAYOUT.maintenance.count) * 40 + 60 },
        ];
        lineConfig.forEach(config => {
            for (let i = 1; i <= config.count; i++) {
                for (let j = 1; j <= config.slots; j++) {
                    const trackY = (config.yOffset || 0) + 60 + (i - 1) * 40;
                    const slotX = 60 + (j - 1) * 120;
                    if (svgP.x > slotX && svgP.x < slotX + 100 && svgP.y > trackY - 14 && svgP.y < trackY + 14) { droppedOn = { type: config.type, line: i, slot: j }; }
                }
            }
        });
        const isOccupied = droppedOn ? allTrainsets.some(t => t._id !== draggedTrain.id && t.location?.type === droppedOn.type && t.location?.line === droppedOn.line && t.location?.slot === droppedOn.slot) : false;
        
        const originalTrain = allTrainsets.find(t => t._id === draggedTrain.id);

        if (droppedOn && !isOccupied && originalTrain) { 
            const newStatus = originalTrain.currentStatus === 'In Service' ? 'Ready' : originalTrain.currentStatus;
            const updatedTrain = { ...originalTrain, location: droppedOn, isDragging: false, currentStatus: newStatus };
            
            // --- API Call to update backend ---
            try {
                const response = await fetch(`/api/trainsets/${draggedTrain.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location: droppedOn, currentStatus: newStatus })
                });
                if (!response.ok) throw new Error('Failed to update trainset location on server.');
                
                // Update frontend state only after successful backend update
                setAllTrainsets(prev => prev.map(t => t._id === draggedTrain.id ? updatedTrain : t));
            } catch (err) {
                console.error(err);
                // Snap back on API error
                setAllTrainsets(prev => prev.map(t => ({ ...t, isDragging: false })));
            }
        } else { 
            // Snap back if drop is invalid
            setAllTrainsets(prev => prev.map(t => ({ ...t, isDragging: false }))); 
        }
        setDraggedTrain(null);
    };
    
    if (isLoading) {
        return <div className="h-screen w-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-16 h-16 animate-spin text-blue-500"/></div>;
    }

    if (error) {
        return <div className="h-screen w-screen bg-slate-900 flex flex-col items-center justify-center text-center p-8"><ServerCrash className="w-16 h-16 text-red-500 mb-4"/><h1 className="text-2xl font-bold">Failed to Load Depot Data</h1><p className="text-red-400 mt-2">{error}</p></div>;
    }

    return (
        <div className="w-screen min-h-screen bg-slate-900 text-white font-sans">
            <div className="p-4">
                <header className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                     <div className="flex items-center gap-3"><HardDrive className="text-blue-400" size={32}/><div><h1 className="text-2xl font-bold">Depot Command Center</h1><p className="text-sm text-slate-400">Live View of Muttom Depot Operations</p></div></div>
                    <div className="flex items-center gap-6">
                        <div className="text-center"><p className="text-sm text-slate-400">In Service</p><p className="text-2xl font-bold text-green-400">{fleetStatus.inService}</p></div>
                        <div className="text-center"><p className="text-sm text-slate-400">Ready</p><p className="text-2xl font-bold text-blue-400">{fleetStatus.ready}</p></div>
                        <div className="text-center"><p className="text-sm text-slate-400">Standby</p><p className="text-2xl font-bold text-cyan-400">{fleetStatus.standby}</p></div>
                        <div className="text-center"><p className="text-sm text-slate-400">Maintenance</p><p className="text-2xl font-bold text-red-400">{fleetStatus.maintenance}</p></div>
                        {USER_ROLE === 'admin' && <button onClick={handleArrangeForService} title="Arrange stabling lines for morning service" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2"><Shuffle size={16}/> Arrange Fleet</button>}
                    </div>
                </header>

                <main className="grid grid-cols-12 gap-4 p-4">
                    <aside className="col-span-3 flex flex-col gap-4">
                        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2"><Train className="text-green-400"/> Trains In Service</h2>
                            <div className="mt-3 space-y-2">
                                {inServiceTrains.length > 0 ? inServiceTrains.map(train => (
                                    <div key={train._id} className="p-2 rounded-md bg-green-500/10 flex items-center justify-between">
                                        <p className="font-bold text-sm">{train._id}</p>
                                        <p className="text-xs text-slate-300">Brake: {train.health.componentWear.brakes}%</p>
                                    </div>
                                )) : <p className="text-sm text-slate-500 text-center">No trains currently in service.</p>}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle className="text-yellow-400"/> Urgent Alerts</h2>
                            <div className="mt-3 space-y-2">{alerts.map(alert => (<div key={alert.id} className={`p-2 rounded-md ${alert.level === 'high' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}><p className="font-bold text-sm">{alert.trainsetId}</p><p className="text-xs text-slate-300">{alert.message}</p></div>))}</div>
                        </div>
                    </aside>

                    <section className="col-span-6 bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                        <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid meet" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                            <text x="50" y="35" className="fill-slate-500 font-bold text-2xl tracking-widest">STABLING YARD</text>
                            <text x="50" y="295" className="fill-slate-500 font-bold text-2xl tracking-widest">MAINTENANCE BAYS</text>
                            <text x="50" y="445" className="fill-slate-500 font-bold text-2xl tracking-widest">WASH LINE</text>
                            
                            {(() => {
                                 const trackHeight = 20; const elements = [];
                                 const lineConfig = [{type: 'stabling',...DEPOT_LAYOUT.stabling}, {type: 'maintenance', ...DEPOT_LAYOUT.maintenance, yOffset: DEPOT_LAYOUT.stabling.count * 40 + 30}, {type: 'wash', ...DEPOT_LAYOUT.wash, yOffset: (DEPOT_LAYOUT.stabling.count + DEPOT_LAYOUT.maintenance.count) * 40 + 60}];
                                 lineConfig.forEach(config => { for (let i = 1; i <= config.count; i++) { const trackY = (config.yOffset || 0) + 60 + (i - 1) * 40; elements.push(<rect key={`${config.type}-track-${i}`} x="50" y={trackY} width="80%" height={trackHeight} fill="#374151" rx="5" />); } });
                                 return elements;
                            })()}
                            
                            {depotTrains.map(train => {
                                const trackHeight = 20; const trainHeight = 28;
                                let y = 60;
                                if (train.location.type === 'maintenance') y += DEPOT_LAYOUT.stabling.count * 40 + 30;
                                if (train.location.type === 'wash') y += (DEPOT_LAYOUT.stabling.count + DEPOT_LAYOUT.maintenance.count) * 40 + 60;

                                const trainX = train.isDragging ? train.dragX : 60 + (train.location.slot - 1) * 120;
                                const trainY = train.isDragging ? train.dragY : y + (train.location.line - 1) * 40 - (trainHeight - trackHeight)/2;

                                return (
                                    <g key={train._id} onMouseDown={(e) => handleMouseDown(e, train._id)} className={`${USER_ROLE === 'admin' ? 'cursor-grab' : 'cursor-pointer'} group`} style={{opacity: train.isDragging ? 0.6 : 1}}>
                                        <rect x={trainX} y={trainY} width="100" height={trainHeight} className={`${STATUS_COLORS[train.currentStatus]} transition-all group-hover:stroke-cyan-400 group-hover:stroke-2`} stroke={selectedTrain?._id === train._id ? '#06B6D4' : '#111827'} strokeWidth="3" rx="4"/>
                                        <text x={trainX + 50} y={trainY + trainHeight / 2} textAnchor="middle" alignmentBaseline="middle" className="fill-white font-bold text-sm pointer-events-none">{train._id}</text>
                                    </g>
                                )
                            })}
                        </svg>
                    </section>

                    <aside className="col-span-3 bg-slate-800/50 rounded-lg border border-slate-700 p-4"><h2 className="text-lg font-semibold flex items-center gap-2"><BarChart/> Selection Details</h2>{selectedTrain ? (<div className="mt-4 space-y-3"><h3 className={`text-2xl font-bold ${STATUS_COLORS[selectedTrain.currentStatus].replace('fill-','text-')}`}>{selectedTrain._id}</h3><div className="text-sm"><p><span className="text-slate-400">Status:</span> {selectedTrain.currentStatus}</p>{selectedTrain.location && <p><span className="text-slate-400">Location:</span> {selectedTrain.location.type} Line {selectedTrain.location.line}, Slot {selectedTrain.location.slot}</p>}</div><div className="pt-3 border-t border-slate-700"><h4 className="font-semibold mb-2">Component Wear (%)</h4><div className="space-y-1 text-sm"><p>Brake Pads: {selectedTrain.health.componentWear.brakes}%</p><div className="w-full bg-slate-700 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{width: `${selectedTrain.health.componentWear.brakes}%`}}></div></div></div><div className="space-y-1 text-sm mt-2"><p>Wheels: {selectedTrain.health.componentWear.wheels}%</p><div className="w-full bg-slate-700 rounded-full h-2"><div className="bg-sky-500 h-2 rounded-full" style={{width: `${selectedTrain.health.componentWear.wheels}%`}}></div></div></div></div></div>) : (<div className="flex items-center justify-center h-full text-slate-500"><p>Click on a train to view details.</p></div>)}</aside>
                </main>
            </div>
        </div>
    );
}

