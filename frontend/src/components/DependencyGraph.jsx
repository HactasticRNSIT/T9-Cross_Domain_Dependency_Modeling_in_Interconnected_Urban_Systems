import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';

export default function DependencyGraph({ failedSystems }) {
  // We define the 5 domains. If the backend says they failed, they turn red. Otherwise, green.
  const nodes = useMemo(() => [
    { 
      id: 'Energy', 
      position: { x: 250, y: 50 }, 
      data: { label: 'Energy Grid' }, 
      style: { background: failedSystems.includes('Energy') ? '#ef4444' : '#22c55e', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px', borderRadius: '5px' } 
    },
    { 
      id: 'Transport', 
      position: { x: 100, y: 150 }, 
      data: { label: 'Transport' }, 
      style: { background: failedSystems.includes('Transport') ? '#ef4444' : '#22c55e', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px', borderRadius: '5px' } 
    },
    { 
      id: 'Water', 
      position: { x: 400, y: 150 }, 
      data: { label: 'Water' }, 
      style: { background: failedSystems.includes('Water') ? '#ef4444' : '#22c55e', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px', borderRadius: '5px' } 
    },
    { 
      id: 'Comms', 
      position: { x: 100, y: 250 }, 
      data: { label: 'Comms' }, 
      style: { background: failedSystems.includes('Comms') ? '#ef4444' : '#22c55e', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px', borderRadius: '5px' } 
    },
    { 
      id: 'Emergency', 
      position: { x: 400, y: 250 }, 
      data: { label: 'Emergency' }, 
      style: { background: failedSystems.includes('Emergency') ? '#ef4444' : '#22c55e', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px', borderRadius: '5px' } 
    },
  ], [failedSystems]);

  // The lines connecting the dominos
  const edges = [
    { id: 'e-energy-trans', source: 'Energy', target: 'Transport', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e-energy-water', source: 'Energy', target: 'Water', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e-energy-comms', source: 'Energy', target: 'Comms', markerEnd: { type: MarkerType.ArrowClosed } },
    { id: 'e-energy-emerg', source: 'Energy', target: 'Emergency', markerEnd: { type: MarkerType.ArrowClosed } },
  ];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="#475569" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}