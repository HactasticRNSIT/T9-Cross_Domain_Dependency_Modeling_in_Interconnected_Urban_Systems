import pandas as pd
import os

# --- THE FIX ---
# This tells Python to find the exact folder this script is sitting in 
# and look for the 'data' folder right next to it.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
# ---------------

print(f"Looking for data inside: {DATA_DIR}")
print("Loading datasets...")

# Notice we use DATA_DIR here now
energy_df = pd.read_csv(os.path.join(DATA_DIR, 'energy.csv'))
water_df = pd.read_csv(os.path.join(DATA_DIR, 'water.csv'))
transport_df = pd.read_csv(os.path.join(DATA_DIR, 'transport.csv'))
comms_df = pd.read_csv(os.path.join(DATA_DIR, 'comms.csv'))
emergency_df = pd.read_csv(os.path.join(DATA_DIR, 'emergency.csv'))
env_df = pd.read_csv(os.path.join(DATA_DIR, 'environment.csv'))

print("Standardizing timestamps and renaming columns...")
dfs = {
    'energy': energy_df, 
    'water': water_df, 
    'transport': transport_df, 
    'comms': comms_df, 
    'emergency': emergency_df, 
    'env': env_df
}

for name, df in dfs.items():
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    df.rename(columns={
        'value': f'{name}_value',
        'value_failed': f'{name}_failed',
        'unit': f'{name}_unit'
    }, inplace=True)

print("Merging datasets into the God-View timeline...")
merged_df = dfs['energy']

for name in ['water', 'transport', 'comms', 'emergency', 'env']:
    merged_df = pd.merge(merged_df, dfs[name], on='timestamp', how='outer')

merged_df = merged_df.sort_values(by=['timestamp'])
# Forward fill to cover any tiny gaps in reporting
merged_df = merged_df.ffill() 

# Save it right back into the data folder
output_path = os.path.join(DATA_DIR, 'merged_city_timeline.csv')
merged_df.to_csv(output_path, index=False)

print(f"SUCCESS! Data linked. Found {len(merged_df)} total timeframes. Saved to {output_path}")