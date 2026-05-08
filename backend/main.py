from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from engine import simulate_cascade

app = FastAPI()

# CRITICAL: This allows your React app to fetch data without being blocked
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/simulate/{node_id}")
def trigger_simulation(node_id: str):
    failed = simulate_cascade(node_id)
    return {"failed_nodes": failed}