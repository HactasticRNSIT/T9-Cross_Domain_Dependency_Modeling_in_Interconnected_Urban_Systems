import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(BASE_DIR, 'data', 'merged_city_timeline.csv')

df = pd.read_csv(file_path)

# 1. Isolate only the "failed" columns to see what breaks
fail_cols = [col for col in df.columns if '_failed' in col]
df_fails = df[fail_cols]

# 2. THE SECRET SAUCE: Time-Delayed Correlation
# We shift the data by 1 timeframe to see if a failure NOW causes a failure LATER
df_shifted = df_fails.shift(-1) 
df_shifted.columns = [f"{col}_DELAYED" for col in fail_cols]

# Combine them and run a correlation matrix
combined = pd.concat([df_fails, df_shifted], axis=1)
correlation_matrix = combined.corr()

print("--- Cross-Domain Dependency Scores ---")
# Let's see how strongly CURRENT energy failures predict DELAYED water/transport failures
if 'energy_failed' in correlation_matrix.columns:
    print(correlation_matrix['energy_failed'].filter(like='DELAYED').sort_values(ascending=False))