import os

files = ['energy.csv', 'water.csv', 'transport.csv', 'comms.csv', 'emergency.csv', 'environment.csv']

print("--- Data Interrogation Starting ---")
for file in files:
    try:
        # Just reads the first line of text directly. No Pandas needed!
        with open(f'data/{file}', 'r') as f:
            header = f.readline().strip()
            print(f"✅ {file} columns: {header}")
    except Exception as e:
        print(f"❌ Error reading {file}: {e}")
print("-----------------------------------")