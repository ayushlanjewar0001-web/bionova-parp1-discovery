import json
import os
import sys
sys.path.insert(0, os.path.abspath("src"))

from pathlib import Path
import numpy as np
import pandas as pd
from bionova_parp1.train import evaluate_predictions

# 1. Load test set and ChemProp predictions
test_df = pd.read_csv("splits/test.csv")
chemprop_test_preds = pd.read_csv("models/chemprop_parp1/model_0/test_predictions.csv")

# Merge on smiles to guarantee exact molecule alignment
merged = pd.merge(test_df, chemprop_test_preds, on="smiles", suffixes=("_true", "_pred"))
print(f"Aligned {len(merged)} test set compounds on canonical SMILES.")

# Compute evaluation metrics with bootstrap CI
metrics = evaluate_predictions(
    merged,
    y_true_col="pIC50_true",
    y_pred_col="pIC50_pred",
    output_metrics_json=Path("results/model_metrics.json"),
    output_preds_csv=Path("results/test_predictions.csv")
)

# Also create model_info.json
model_info = {
    "framework": "ChemProp v2 (D-MPNN)",
    "version": "2.3.1",
    "checkpoint": "models/chemprop_parp1/model_0/best.pt",
    "architecture": {
        "message_passing": "BondMessagePassing",
        "message_hidden_dim": 300,
        "depth": 3,
        "ffn_hidden_dim": 300,
        "ffn_num_layers": 1,
        "aggregation": "norm"
    },
    "training_parameters": {
        "epochs": 30,
        "best_epoch": 27,
        "best_val_loss": 0.63,
        "batch_size": 64,
        "seed": 42
    },
    "holdout_metrics": metrics
}

with open("models/model_info.json", "w") as f:
    json.dump(model_info, f, indent=2)

print("\n=== ACCURATE MODEL EVALUATION METRICS ===")
for k, v in metrics.items():
    print(f"  {k}: {v}")
