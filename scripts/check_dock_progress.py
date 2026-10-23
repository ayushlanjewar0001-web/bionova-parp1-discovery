import pandas as pd
from pathlib import Path

p = Path("results/docking_results.csv")
if p.exists():
    df = pd.read_csv(p)
    succ = (df["docking_status"] == "COMPLETED").sum()
    print(f"Total processed: {len(df)}/100 | Successfully docked: {succ} | Failures: {len(df) - succ}")
    if succ > 0:
        succ_df = df[df["docking_status"] == "COMPLETED"]
        print(f"Latest docked: {succ_df.iloc[-1]['compound_id']} -> {succ_df.iloc[-1]['docking_affinity_kcal_mol']} kcal/mol")
        print(f"Top 3 affinities so far: {succ_df['docking_affinity_kcal_mol'].nsmallest(3).tolist()}")
else:
    print("docking_results.csv does not exist yet.")
