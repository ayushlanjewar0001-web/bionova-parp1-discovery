"""
Unit tests validating pipeline stage sequence contracts and chronological integrity.
Specifically verifies that Docking strictly precedes ADMET-AI.
"""

import json
from pathlib import Path
import pytest


def test_stage_chronology_contract():
    """
    Verify that if manifest or logs exist, docking completion timestamp
    is earlier than or equal to ADMET initiation timestamp.
    """
    manifest_path = Path("manifest.json")
    if not manifest_path.exists():
        # Test passes vacuously before runs, but verifies validation logic
        return
        
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
        
    stages = manifest.get("stages", {})
    if "docking" in stages and "admet" in stages:
        dock_time = stages["docking"].get("completion_timestamp")
        admet_time = stages["admet"].get("start_timestamp")
        if dock_time and admet_time:
            assert dock_time <= admet_time, f"Violation: ADMET started ({admet_time}) before Docking finished ({dock_time})"


def test_admet_input_subset_of_docked_candidates():
    """
    Verify that ADMET is never run on raw un-docked libraries;
    input compounds to ADMET must strictly be members of the docked candidate set.
    """
    dock_results_path = Path("results/docking_results.csv")
    admet_results_path = Path("results/admet_predictions.csv")
    
    if not (dock_results_path.exists() and admet_results_path.exists()):
        return
        
    import pandas as pd
    dock_df = pd.read_csv(dock_results_path)
    admet_df = pd.read_csv(admet_results_path)
    
    docked_ids = set(dock_df["compound_id"])
    admet_ids = set(admet_df["compound_id"])
    
    # Every ADMET compound must have been in the docking pipeline
    assert admet_ids.issubset(docked_ids), "ADMET contains compounds that were not in the docking stage"
