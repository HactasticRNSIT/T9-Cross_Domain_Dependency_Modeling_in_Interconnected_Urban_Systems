import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // The dependency logic from engine.py
  const DEPENDENCY_WEIGHTS: Record<string, number> = {
    "Transport": 0.96,
    "Water": 0.70,
    "Comms": 0.16,
    "Environment": 0.13,
    "Emergency": -0.06
  };

  function simulateCascade(startNode: string, threshold: number = 0.5) {
    const graph: Record<string, Array<{ target: string; weight: number }>> = {
      "Energy": [
        { target: "Transport", weight: 0.96 },
        { target: "Water", weight: 0.70 },
        { target: "Comms", weight: 0.16 },
        { target: "Environment", weight: 0.13 },
        { target: "Emergency", weight: -0.06 }
      ],
      "Water": [
        { target: "Environment", weight: 0.88 },
        { target: "Emergency", weight: 0.45 },
        { target: "Energy", weight: 0.20 }
      ],
      "Transport": [
        { target: "Emergency", weight: 0.92 },
        { target: "Comms", weight: 0.55 },
        { target: "Energy", weight: 0.15 }
      ],
      "Comms": [
        { target: "Emergency", weight: 0.75 },
        { target: "Transport", weight: 0.30 }
      ],
      "Emergency": [
        { target: "Transport", weight: 0.40 }
      ]
    };

    if (!(startNode in graph)) {
      return [startNode]; // Just the node itself fails if no known dependencies
    }

    const failedNodes = new Set([startNode]);
    const neighbors = graph[startNode] || [];

    for (const neighbor of neighbors) {
      if (neighbor.weight >= threshold) {
        failedNodes.add(neighbor.target);
      }
    }

    return Array.from(failedNodes);
  }

  // API Routes
  app.get("/api/simulate/:node_id", (req, res) => {
    const nodeId = req.params.node_id;
    const failedNodes = simulateCascade(nodeId);
    res.json({ failed_nodes: failedNodes });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
