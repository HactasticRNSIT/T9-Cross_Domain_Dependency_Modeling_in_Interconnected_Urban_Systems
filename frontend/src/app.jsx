import React, { useState } from 'react';
import { runSimulation } from './api'; 
import DependencyGraph from './components/DependencyGraph';

export default function App() {
  const [target, setTarget] = useState('Energy');
  const [failedSystems, setFailedSystems] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleTrigger = async () => {
    setIsSimulating(true);
    
    try {
      // We pass the currently selected dropdown value (target) to your Python API
      const affected = await runSimulation(target); 
      setFailedSystems(affected);
    } catch (error) {
      console.error("Backend connection failed!", error);
      setFailedSystems(["Error: Could not connect to Python backend"]);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      
      {/* HEADER */}
      <header className="mb-6 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">City Resilience Dashboard</h1>
      </header>

      {/* MAIN GRID: 12 Columns Total */}
      <div className="grid grid-cols-12 gap-6 h-[85vh]">

        {/* LEFT PANEL: Controls (3 Columns) */}
        <div className="col-span-3 flex flex-col gap-6">
          
          {/* Simulation Trigger Card */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Trigger Simulation</h2>
            <div className="flex flex-col gap-3">
              <select 
                className="p-2 rounded bg-slate-700 border border-slate-600 text-white w-full focus:ring-2 focus:ring-blue-500"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="Energy">Energy Grid</option>
                <option value="Water">Water Supply</option>
                <option value="Transport">Transport Network</option>
              </select>
              <button 
                onClick={handleTrigger}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow-lg transition-colors"
              >
                {isSimulating ? 'Simulating...' : 'Simulate Failure'}
              </button>
            </div>
          </div>

          {/* Cascading Failures Card */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg flex-grow">
            <h2 className="text-xl font-semibold mb-4 text-slate-200">Cascading Failures</h2>
            {failedSystems.length === 0 ? (
              <p className="text-slate-400 italic">System is currently stable.</p>
            ) : (
              <ul className="space-y-3">
                {failedSystems.map((system, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-red-900/30 border border-red-500/50 p-3 rounded text-red-400 font-medium">
                    <span>{system}</span>
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">OFFLINE</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* CENTER PANEL: Map & Graph (6 Columns) */}
        <div className="col-span-6 flex flex-col gap-6">
          
          {/* Map Placeholder */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg flex-grow relative overflow-hidden flex items-center justify-center">
            <span className="text-slate-500 font-mono text-lg">[ React Leaflet Map Goes Here ]</span>
          </div>

          {/* Graph Placeholder */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg h-1/2 relative flex items-center justify-center">
            <span className="text-slate-500 font-mono text-lg">[ React Flow Dependency Graph Goes Here ]</span>
          </div>

        </div>

        {/* RIGHT PANEL: Stats & AI Summary (3 Columns) */}
        <div className="col-span-3 flex flex-col gap-6">
          
          {/* Impact Stats Card */}
          <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg flex-grow flex items-center justify-center">
            <span className="text-slate-500 font-mono text-sm text-center">[ Recharts Bar Charts Go Here ]</span>
          </div>

          {/* AI Summary Card */}
          <div className="bg-blue-900/20 p-5 rounded-xl border border-blue-500/50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <h2 className="text-xl font-semibold mb-3 text-blue-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              AI Executive Summary
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {failedSystems.length > 0 
                ? "The power grid just failed. Our ML model shows a 0.96 probability of transport failure and 0.70 probability of water failure in the next 15 minutes. Emergency systems are stable (-0.06)."
                : "All systems operating within normal parameters. No active disruptions detected across the urban network."}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}