import React, { useState, useEffect } from 'react';
import { runSimulation } from './api'; 
import DependencyGraph from './components/DependencyGraph';
import TicketSystem from './components/TicketSystem';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Activity, Database, MapPin, Zap, Info, ShieldAlert, ArrowRight, Clock, Shield } from 'lucide-react';

export default function App() {
  const [target, setTarget] = useState('Energy');
  const [failedSystems, setFailedSystems] = useState([]);
  const [cascadeTimeline, setCascadeTimeline] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [user, setUser] = useState(null);
  const [fluctuations, setFluctuations] = useState({
    Energy: 50,
    Transport: 50,
    Water: 50,
    Comms: 50,
    Emergency: 50,
    Environment: 50
  });
  const [activeTickets, setActiveTickets] = useState([]);
  const [logs, setLogs] = useState([
    { time: '10:42:01', msg: 'SYSTEM_BOOT: KERNEL_INIT_OK', type: 'info' },
    { time: '10:42:05', msg: 'DATABASE_LINK: ESTABLISHED', type: 'info' },
    { time: '10:42:10', msg: 'NETWORK_SCAN: ALL_NODES_STABLE', type: 'info' }
  ]);

  const [activeRightTab, setActiveRightTab] = useState('analysis');

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [{ time, msg, type }, ...prev].slice(0, 10));
  };

  const handleTrigger = async () => {
    setIsSimulating(true);
    addLog(`INITIATING_CASCADE_ANALYSIS: TARGET=${target.toUpperCase()}`, 'warn');
    
    try {
      const result = await runSimulation(target); 
      setFailedSystems(result.nodes || []);
      setCascadeTimeline(result.timeline || []);

      if (result.nodes?.length > 1) {
        addLog(`CASCADE_DETECTED: ${result.nodes.length} NODES_AFFECTED`, 'error');
      } else {
        addLog(`ANALYSIS_COMPLETE: LOCAL_FAILURE_ONLY`, 'info');
      }
    } catch (error) {
      console.error("Backend connection failed!", error);
      setFailedSystems(["Error: Connection Failure"]);
      addLog(`CRITICAL_ERROR: API_DISCONNECT`, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setFailedSystems([]);
    setCascadeTimeline([]);
    setFluctuations({
      Energy: 50,
      Transport: 50,
      Water: 50,
      Comms: 50,
      Emergency: 50,
      Environment: 50
    });
    addLog('TOPOLOGY_RESET: ALL_SYSTEMS_NOMINAL', 'info');
  };

  // Auth State Tracking
  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        addLog(`IDENTITY_VERIFIED: ${u.email}`, 'info');
      }
    });
  }, []);

  // Firebase listener for Informed Alerts
  useEffect(() => {
    if (!user) {
      setActiveTickets([]);
      return;
    }

    const q = query(
      collection(db, 'tickets'), 
      where('domain', '==', target),
      where('status', '==', 'open')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActiveTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'tickets');
    });

    return () => unsubscribe();
  }, [target, user]);

  // Derived metrics based on current target and fluctuations
  const currentFluctuation = fluctuations[target] || 50;
  const deviation = Math.abs(currentFluctuation - 50);

  const integrityValue = failedSystems.includes(target) 
    ? '00.0' 
    : Math.max(0, 98.4 - (deviation * 1.5)).toFixed(1);
  
  const criticalityValue = (Math.min(100, (deviation * 2) + (failedSystems.length * 15))).toFixed(1);

  return (
    <div className="w-full h-screen bg-[#05060a] text-slate-300 font-sans flex flex-col p-6 lg:p-10 select-none relative">
      <div className="absolute top-2 right-2 text-[8px] text-slate-800 pointer-events-none">UI_ACTIVE_VERSION_02</div>
      
      {/* Header Section */}
      <header className="flex justify-between items-end border-b border-slate-800 pb-6 mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-400 uppercase mb-2">Project T1-RNSIT</span>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase leading-none">
            Cross-Domain Dependency <span className="text-cyan-500">Modeling</span>
          </h1>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Urban System Node:</div>
          <div className="text-xl font-light text-slate-300">METRO-DISTRICT_B4</div>
        </div>
      </header>

      {/* Main Modeling Viewport */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 overflow-hidden">
        
        {/* Sidebar Left: Domain Metrics */}
        <div className="col-span-1 md:col-span-3 space-y-6 overflow-y-auto">
          
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-lg">
            <h3 className="text-[11px] font-mono uppercase text-slate-500 mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3 text-cyan-400" />
              Sector Intelligence
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase mb-2 block tracking-widest">Active Sector Node</label>
                <select 
                  className="w-full bg-[#0a0c14] border border-slate-800 p-2 text-xs text-white rounded outline-none focus:border-cyan-500 transition-colors"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="Energy">Energy Grid Pulse</option>
                  <option value="Water">Water Infrastructure</option>
                  <option value="Transport">Transport Arteries</option>
                  <option value="Comms">Communication Nodes</option>
                  <option value="Emergency">Emergency Response</option>
                  <option value="Environment">Environment Systems</option>
                </select>
              </div>

                <div className="space-y-4 pt-4 border-t border-slate-800/50">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono text-cyan-400 uppercase tracking-tighter">
                      {target === 'Energy' ? 'Grid Load Variance' : 
                       target === 'Transport' ? 'Traffic Flow Volume' :
                       target === 'Water' ? 'Pump Pressure Delta' :
                       target === 'Comms' ? 'Signal Noise Ratio' :
                       target === 'Emergency' ? 'Unit Response Load' : 'Bio-Feedback Shift'}
                    </label>
                    <span className={`text-[9px] font-mono ${deviation > 25 ? 'text-pink-500 animate-pulse' : 'text-slate-500'}`}>
                      {currentFluctuation > 50 ? '+' : ''}{currentFluctuation - 50}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={currentFluctuation}
                    onChange={(e) => setFluctuations({...fluctuations, [target]: parseInt(e.target.value)})}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="flex justify-between text-[7px] font-mono text-slate-600 uppercase">
                    <span>{target === 'Energy' ? 'Deficit' : target === 'Transport' ? 'Sparse' : 'Min'}</span>
                    <span>Nominal</span>
                    <span>{target === 'Energy' ? 'Overload' : target === 'Transport' ? 'Gridlock' : 'Peak'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="border-l-2 border-cyan-500 pl-4 mb-5">
                    <h3 className="text-[11px] font-mono uppercase text-slate-500 mb-2">Sector Integrity</h3>
                    <div className="flex items-center gap-4 mb-1">
                      <span className="text-2xl font-bold text-white tracking-tighter">
                        {integrityValue}%
                      </span>
                      <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-300" 
                          style={{ width: `${integrityValue}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase">Localized Telemetry Active</p>
                  </div>

                  <div className="border-l-2 border-pink-500 pl-4 mb-5">
                    <h3 className="text-[11px] font-mono uppercase text-slate-500 mb-2">Cascade Criticality</h3>
                    <div className="flex items-center gap-4 mb-1">
                      <span className={`text-2xl font-bold border-b border-pink-500/30 ${parseFloat(criticalityValue) > 60 ? 'text-pink-500' : 'text-white'}`}>
                        {criticalityValue}%
                      </span>
                      <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${parseFloat(criticalityValue) > 60 ? 'bg-pink-500' : 'bg-slate-500'}`}
                          style={{ width: `${criticalityValue}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase">Protocol Sensitivity: Optimized</p>
                  </div>

                  {activeTickets.length > 0 && (
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 mb-5">
                      <h4 className="text-[10px] font-mono text-indigo-400 uppercase mb-2 flex items-center gap-2">
                        < ShieldAlert className="w-3 h-3" />
                        Informed Alerts
                      </h4>
                      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                        {activeTickets.map(ticket => (
                          <div key={ticket.id} className="text-[10px] border-l border-indigo-500/50 pl-2 py-1">
                            <span className="text-white block font-bold truncate tracking-tight">{ticket.title}</span>
                            <span className="text-indigo-400/70 text-[8px] uppercase tracking-tighter font-mono">
                              LVL: {ticket.severity} • CID_{ticket.id.slice(0,4)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cascadeTimeline.length > 0 && (
                     <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-4 mt-6">
                       <h3 className="text-[11px] font-mono uppercase text-cyan-400 mb-4 flex items-center gap-2">
                         <ShieldAlert className="w-3 h-3" />
                         Simulated Cascade Alerts
                       </h3>
                     <div className="space-y-4">
                       {cascadeTimeline.map((evt, idx) => (
                         <div key={idx} className="relative pl-6 border-l border-slate-800 pb-2 last:pb-0">
                           <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></div>
                           <div className="flex justify-between items-start mb-1 text-[10px] font-mono">
                             <span className="text-white font-bold">{evt.node.toUpperCase()}</span>
                             <span className="text-slate-500">+{evt.timeDelay.toFixed(1)}s</span>
                           </div>
                           <div className="flex items-center gap-2 text-[9px] text-slate-500 uppercase italic">
                             <ArrowRight className="w-2.5 h-2.5 text-pink-500" />
                             {evt.cause.split('_').join(' ')}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
            <h4 className="text-[10px] font-mono text-cyan-400 uppercase mb-3 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Active Dependencies
            </h4>
            <ul className="space-y-3 text-xs">
              {['Transport', 'Water', 'Comms', 'Environment'].map((sys) => (
                <li key={sys} className="flex justify-between items-center group">
                  <span className="text-slate-400">{sys} Domain</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${failedSystems.includes(sys) ? 'bg-pink-500/20 text-pink-500 border border-pink-500/50' : 'bg-green-500/20 text-green-500 border border-green-500/50'}`}>
                    {failedSystems.includes(sys) ? 'FAILED' : 'STABLE'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center: Dependency Graph Representation */}
        <div className="col-span-1 md:col-span-6 relative bg-slate-900/20 border border-slate-800 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="w-full h-full relative z-10 flex flex-col">
             <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <div className="text-[10px] font-mono text-cyan-400 mb-1 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 animate-pulse rounded-full"></div>
                  INTERACTIVE_TOPOLOGY_STREAM
                </div>
             </div>
             <div className="flex-1 w-full relative">
                <DependencyGraph 
                  target={target} 
                  failedSystems={failedSystems} 
                  onNodeClick={(nodeId) => {
                    setTarget(nodeId);
                    addLog(`NODE_SELECTED: ${nodeId.toUpperCase()}`, 'info');
                  }} 
                />
             </div>
          </div>
        </div>

        {/* Sidebar Right: Incident Management & Logs */}
        <div className="col-span-1 md:col-span-3 flex flex-col h-full overflow-hidden space-y-4">
          
          {/* Tab Selection */}
          <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveRightTab('analysis')}
              className={`flex-1 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded transition-all ${activeRightTab === 'analysis' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Analysis
            </button>
            <button 
              onClick={() => setActiveRightTab('tickets')}
              className={`flex-1 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded transition-all ${activeRightTab === 'tickets' ? 'bg-cyan-600 text-black font-bold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Tickets
            </button>
            <button 
              onClick={() => setActiveRightTab('logs')}
              className={`flex-1 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded transition-all ${activeRightTab === 'logs' ? 'bg-cyan-600 text-black font-bold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Stream
            </button>
          </div>

          <div className="flex-1 border border-slate-800 bg-[#07080f]/50 rounded-lg p-5 overflow-hidden flex flex-col relative">
            {activeRightTab === 'analysis' && (
              <div className="flex flex-col h-full overflow-hidden">
                <h3 className="text-[11px] font-mono uppercase text-indigo-400 border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Predictive Analysis
                </h3>
                
                {failedSystems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 grayscale opacity-40">
                    <Database className="w-10 h-10 text-slate-700" />
                    <p className="text-[10px] uppercase font-mono max-w-[150px]">No active incident data for predictive processing.</p>
                  </div>
                ) : (
                  <div className="space-y-6 overflow-y-auto pr-1">
                    <div className="space-y-4">
                      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded p-3">
                        <h4 className="text-[9px] text-indigo-300 uppercase font-bold mb-3 flex items-center gap-2">
                           <Clock className="w-2.5 h-2.5" />
                           Recovery Projections
                        </h4>
                        <div className="space-y-3">
                           <div>
                             <div className="flex justify-between text-[11px] font-mono mb-1">
                               <span className="text-slate-500 uppercase tracking-tighter">Mean Restoration</span>
                               <span className="text-indigo-400">{(failedSystems.length * 3.8).toFixed(1)}h</span>
                             </div>
                             <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: '40%' }}></div>
                             </div>
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                             <div className="bg-slate-900/60 border border-slate-800 p-2 rounded">
                               <span className="block text-[8px] text-slate-500 uppercase mb-1">Optimistic</span>
                               <span className="text-xs font-bold text-green-500">{(failedSystems.length * 1.2).toFixed(1)}h</span>
                             </div>
                             <div className="bg-slate-900/60 border border-slate-800 p-2 rounded">
                               <span className="block text-[8px] text-slate-500 uppercase mb-1">Critical Load</span>
                               <span className="text-xs font-bold text-pink-500">{(Math.pow(failedSystems.length, 2) * 5.2).toFixed(1)}h</span>
                             </div>
                           </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[10px] font-mono text-cyan-400 uppercase flex items-center gap-2">
                           <Info className="w-2.5 h-2.5" />
                           Topological Impact Info
                        </div>
                        <p className="text-[11px] leading-[1.5] text-slate-400">
                          {failedSystems.length <= 2 
                           ? `Minimal systemic disruption. Automated failsafes are currently rerouting operational load across healthy sectors. Manual intervention low priority.`
                           : `Severe sector instability. ${failedSystems.length} systems are reporting sync errors. Protocol 9 activation prioritized for critical sector preservation. Expect secondary cascades if not isolated within 120s.`}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-800">
                        <h4 className="text-[9px] text-slate-500 uppercase font-bold mb-2">Dominant Sequence</h4>
                        <div className="space-y-1">
                          {cascadeTimeline.map((node, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px]">
                              <span className="text-slate-600">[{i+1}]</span>
                              <span className={i === 0 ? "text-pink-500 font-bold" : "text-slate-300"}>{node.node}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeRightTab === 'tickets' && (
              <TicketSystem failedSystems={failedSystems} onAlert={addLog} />
            )}

            {activeRightTab === 'logs' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="text-slate-500 mb-4 uppercase tracking-[0.1em] border-b border-slate-800 pb-2 flex items-center justify-between">
                  Event Feed Stream
                  <ShieldAlert className="w-3 h-3 text-cyan-500 animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {logs.map((log, i) => (
                    <div key={i} className={`flex gap-2 ${log.type === 'error' ? 'text-pink-500' : log.type === 'warn' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                      <span className="opacity-50 min-w-[55px]">[{log.time}]</span> 
                      <span className="break-all">{log.msg}</span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="h-full flex items-center justify-center text-slate-700 italic text-[10px]">No stream data active.</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleTrigger}
              disabled={isSimulating}
              className={`w-full group relative overflow-hidden font-bold py-4 text-xs uppercase tracking-[0.2em] transition-all rounded ${isSimulating ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 hover:bg-cyan-500 text-black'}`}
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isSimulating ? <Activity className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isSimulating ? 'Processing...' : 'Initiate Cascade Analysis'}
              </div>
              {!isSimulating && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
            </button>

            <button 
              onClick={handleReset}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-mono py-2 text-[10px] uppercase tracking-widest transition-colors rounded border border-slate-700"
            >
              Reset Live Topology
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <footer className="mt-10 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono border-t border-slate-800 pt-6 text-slate-500 gap-4 sm:gap-0">
        <div className="flex flex-wrap gap-4 sm:gap-8 justify-center">
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3 text-green-500" />
            <span className="text-green-500">DATABASE_LINK_ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            <span>LATENCY: 12ms</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            <span className="hidden lg:inline">COORDINATES: 40.7128° N, 74.0060° W</span>
            <span className="lg:hidden">NYC_GRID_B4</span>
          </div>
        </div>
        <div className="uppercase tracking-widest text-center sm:text-right">
          Urban Systems Dependency Engine v2.0.4-Stable
        </div>
      </footer>
    </div>
  );
}
