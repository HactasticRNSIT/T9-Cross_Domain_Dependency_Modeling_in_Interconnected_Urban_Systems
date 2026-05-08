import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

export default function DependencyGraph({ target, failedSystems, onNodeClick }) {
  // We define the 5 domains. If the backend says they failed, they turn red. Otherwise, green.
  const handleNodeClick = (event, node) => {
    if (onNodeClick) onNodeClick(node.id);
  };
  const nodes = useMemo(() => [
    { 
      id: 'Energy', 
      position: { x: 250, y: 50 }, 
      data: { label: 'ENERGY_GRID' }, 
      style: { 
        background: failedSystems.includes('Energy') ? '#ec4899' : '#0891b2', 
        color: 'white', 
        fontWeight: 'bold', 
        border: target === 'Energy' ? '2px solid #fff' : '1px solid ' + (failedSystems.includes('Energy') ? '#f472b6' : '#22d3ee'), 
        fontSize: '10px',
        fontFamily: 'monospace',
        padding: '10px', 
        borderRadius: '2px',
        boxShadow: target === 'Energy' ? '0 0 20px #fff' : (failedSystems.includes('Energy') ? '0 0 25px rgba(236, 72, 113, 0.8)' : '0 0 15px rgba(34, 211, 238, 0.4)'),
        zIndex: failedSystems.includes('Energy') || target === 'Energy' ? 1000 : 1
      } 
    },
    { 
      id: 'Transport', 
      position: { x: 50, y: 150 }, 
      data: { label: 'TRANSPORT' }, 
      style: { 
        background: failedSystems.includes('Transport') ? '#ec4899' : '#0891b2', 
        color: 'white', 
        fontWeight: 'bold', 
        border: target === 'Transport' ? '2px solid #fff' : '1px solid ' + (failedSystems.includes('Transport') ? '#f472b6' : '#22d3ee'), 
        fontSize: '10px',
        fontFamily: 'monospace',
        padding: '10px', 
        borderRadius: '2px',
        boxShadow: target === 'Transport' ? '0 0 20px #fff' : (failedSystems.includes('Transport') ? '0 0 25px rgba(236, 72, 113, 0.8)' : 'none'),
        zIndex: failedSystems.includes('Transport') || target === 'Transport' ? 1000 : 1
      } 
    },
    { 
      id: 'Water', 
      position: { x: 450, y: 150 }, 
      data: { label: 'WATER_SUPPLY' }, 
      style: { 
        background: failedSystems.includes('Water') ? '#ec4899' : '#0891b2', 
        color: 'white', 
        fontWeight: 'bold', 
        border: target === 'Water' ? '2px solid #fff' : '1px solid ' + (failedSystems.includes('Water') ? '#f472b6' : '#22d3ee'), 
        fontSize: '10px',
        fontFamily: 'monospace',
        padding: '10px', 
        borderRadius: '2px',
        boxShadow: target === 'Water' ? '0 0 20px #fff' : (failedSystems.includes('Water') ? '0 0 25px rgba(236, 72, 113, 0.8)' : 'none'),
        zIndex: failedSystems.includes('Water') || target === 'Water' ? 1000 : 1
      } 
    },
    { 
      id: 'Comms', 
      position: { x: 50, y: 300 }, 
      data: { label: 'COMMUNICATIONS' }, 
      style: { 
        background: failedSystems.includes('Comms') ? '#ec4899' : '#0891b2', 
        color: 'white', 
        fontWeight: 'bold', 
        border: target === 'Comms' ? '2px solid #fff' : '1px solid ' + (failedSystems.includes('Comms') ? '#f472b6' : '#22d3ee'), 
        fontSize: '10px',
        fontFamily: 'monospace',
        padding: '10px', 
        borderRadius: '2px',
        boxShadow: target === 'Comms' ? '0 0 20px #fff' : (failedSystems.includes('Comms') ? '0 0 25px rgba(236, 72, 113, 0.8)' : 'none'),
        zIndex: failedSystems.includes('Comms') || target === 'Comms' ? 1000 : 1
      } 
    },
    { 
      id: 'Emergency', 
      position: { x: 450, y: 300 }, 
      data: { label: 'EMERGENCY_SYS' }, 
      style: { 
        background: failedSystems.includes('Emergency') ? '#ec4899' : '#0891b2', 
        color: 'white', 
        fontWeight: 'bold', 
        border: target === 'Emergency' ? '2px solid #fff' : '1px solid ' + (failedSystems.includes('Emergency') ? '#f472b6' : '#22d3ee'), 
        fontSize: '10px',
        fontFamily: 'monospace',
        padding: '10px', 
        borderRadius: '2px',
        boxShadow: target === 'Emergency' ? '0 0 20px #fff' : (failedSystems.includes('Emergency') ? '0 0 25px rgba(236, 72, 113, 0.8)' : 'none'),
        zIndex: failedSystems.includes('Emergency') || target === 'Emergency' ? 1000 : 1
      } 
    },
    { 
      id: 'Environment', 
      position: { x: 250, y: 220 }, 
      data: { label: 'ENVIRONMENT' }, 
      style: { 
        background: failedSystems.includes('Environment') ? '#ec4899' : '#0891b2', 
        color: 'white', 
        fontWeight: 'bold', 
        border: target === 'Environment' ? '2px solid #fff' : '1px solid ' + (failedSystems.includes('Environment') ? '#f472b6' : '#22d3ee'), 
        fontSize: '10px',
        fontFamily: 'monospace',
        padding: '10px', 
        borderRadius: '2px',
        boxShadow: target === 'Environment' ? '0 0 20px #fff' : (failedSystems.includes('Environment') ? '0 0 25px rgba(236, 72, 113, 0.8)' : 'none'),
        zIndex: failedSystems.includes('Environment') || target === 'Environment' ? 1000 : 1
      } 
    }
  ], [failedSystems, target]);

  // The lines connecting the nodes
  const edges = useMemo(() => {
    const rawEdges = [
      { id: 'en-tr', source: 'Energy', target: 'Transport' },
      { id: 'en-wa', source: 'Energy', target: 'Water' },
      { id: 'en-cm', source: 'Energy', target: 'Comms' },
      { id: 'en-ev', source: 'Energy', target: 'Environment' },
      { id: 'en-em', source: 'Energy', target: 'Emergency' },
      
      { id: 'wa-ev', source: 'Water', target: 'Environment' },
      { id: 'wa-em', source: 'Water', target: 'Emergency' },
      { id: 'wa-en', source: 'Water', target: 'Energy' },
      
      { id: 'tr-em', source: 'Transport', target: 'Emergency' },
      { id: 'tr-cm', source: 'Transport', target: 'Comms' },
      { id: 'tr-en', source: 'Transport', target: 'Energy' },
      
      { id: 'cm-em', source: 'Comms', target: 'Emergency' },
      { id: 'cm-tr', source: 'Comms', target: 'Transport' },
      
      { id: 'em-tr', source: 'Emergency', target: 'Transport' },
    ];

    return rawEdges.map(edge => {
      const isFailedPath = failedSystems.includes(edge.source);
      const isTargetFailed = failedSystems.includes(edge.target);
      const isCascadeActive = isFailedPath && isTargetFailed;

      return {
        ...edge,
        animated: isCascadeActive,
        style: { 
          stroke: isCascadeActive ? '#ec4899' : (isFailedPath ? '#db2777' : '#334155'),
          strokeWidth: isCascadeActive ? 3 : 1,
          opacity: isCascadeActive ? 1 : 0.4
        },
        markerEnd: { 
          type: MarkerType.ArrowClosed, 
          color: isCascadeActive ? '#ec4899' : (isFailedPath ? '#db2777' : '#334155')
        }
      };
    });
  }, [failedSystems]);

  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background color="#334155" gap={20} size={1} />
        <Controls showInteractive={false} className="bg-slate-800 border-slate-700 fill-white" />
      </ReactFlow>
    </div>
  );
}
