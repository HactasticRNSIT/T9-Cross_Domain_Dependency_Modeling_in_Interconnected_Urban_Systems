import json
import os

os.makedirs("data", exist_ok=True)

mock_data = {
    "nodes": [
        {"id": "Power_A", "type": "energy"},
        {"id": "Water_Pump_1", "type": "water"},
        {"id": "Hospital_Main", "type": "emergency"}
    ],
    "edges": [
        {"source": "Power_A", "target": "Water_Pump_1"},
        {"source": "Water_Pump_1", "target": "Hospital_Main"}
    ]
}

with open("data/mock_city.json", "w") as f:
    json.dump(mock_data, f, indent=4)
print("Mock data generated successfully!")