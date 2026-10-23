"""
BioNova PARP1 Rapid Pilot Runner.
Executes an end-to-end smoke test through Data Curation -> ChemProp -> Screening -> Docking -> ADMET.
"""

import os
import sys
sys.path.insert(0, os.path.abspath("src"))

import subprocess

def run_pilot():
    print("Running BioNova PARP1 pilot...")
    py = sys.executable
    subprocess.run([py, "scripts/resume_pipeline.py"], check=True)

if __name__ == "__main__":
    run_pilot()
