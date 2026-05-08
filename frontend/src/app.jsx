import React, { useState } from 'react';
import { runSimulation } from './api';

export default function App() {
    const [failedSystems, setFailedSystems] = useState([]);

    const handleTrigger = async () => {
        // Hardcoding Power_A to test the pipeline
        const affected = await runSimulation("Power_A");
        setFailedSystems(affected);
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
            <h1>City Resilience Dashboard</h1>
            <button
                onClick={handleTrigger}
                style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                Simulate Failure at Power_A
            </button>

            <div style={{ marginTop: '30px' }}>
                <h2>Cascading Failures:</h2>
                <ul>
                    {failedSystems.map((node, index) => (
                        <li key={index} style={{ color: '#dc2626', fontWeight: 'bold' }}>
                            {node} went offline
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}