import axios from 'axios';

// FastAPI runs on port 8000 by default - but now we use same origin
const BASE_URL = '';

export const runSimulation = async (nodeId) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/simulate/${nodeId}`);
        return response.data;
    } catch (error) {
        console.error("API Error - is Python running?", error);
        return { nodes: [], timeline: [] };
    }
};