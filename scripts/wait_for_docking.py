import time
import pandas as pd
from pathlib import Path

def wait():
    dock_results = Path("results/docking_results.csv")
    while True:
        if dock_results.exists():
            try:
                df = pd.read_csv(dock_results)
                n = len(df)
                succ = (df["docking_status"] == "COMPLETED").sum()
                fail = (df["docking_status"] != "COMPLETED").sum()
                print(f"Status: {n}/100 processed ({succ} completed, {fail} failed)")
                if n >= 100:
                    print("All 100 candidates processed!")
                    break
            except Exception as e:
                print(f"Read error: {e}")
        time.sleep(4)

if __name__ == "__main__":
    wait()
