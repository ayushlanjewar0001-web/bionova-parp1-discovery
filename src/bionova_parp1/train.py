"""
BioNova PARP1 ChemProp v2 Training & Holdout Evaluation Module
Coordinates D-MPNN model training on explicit scaffold splits and computes rigorous validation metrics.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from scipy import stats
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


def compute_regression_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    n_bootstrap: int = 1000,
    seed: int = 42
) -> Dict:
    """
    Compute RMSE, MAE, R^2, Pearson r, and Spearman rho with 95% bootstrap confidence intervals.
    """
    y_true = np.asarray(y_true).ravel()
    y_pred = np.asarray(y_pred).ravel()
    
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))
    
    # Pearson and Spearman correlations
    pearson_r, pearson_p = stats.pearsonr(y_true, y_pred)
    spearman_rho, spearman_p = stats.spearmanr(y_true, y_pred)
    
    # Bootstrap 95% CI for RMSE and MAE
    rng = np.random.RandomState(seed)
    n = len(y_true)
    rmse_samples = []
    mae_samples = []
    r2_samples = []
    
    if n > 5:
        for _ in range(n_bootstrap):
            idx = rng.choice(n, size=n, replace=True)
            y_t_b = y_true[idx]
            y_p_b = y_pred[idx]
            rmse_samples.append(np.sqrt(mean_squared_error(y_t_b, y_p_b)))
            mae_samples.append(mean_absolute_error(y_t_b, y_p_b))
            r2_samples.append(r2_score(y_t_b, y_p_b))
            
        rmse_ci = [float(np.percentile(rmse_samples, 2.5)), float(np.percentile(rmse_samples, 97.5))]
        mae_ci = [float(np.percentile(mae_samples, 2.5)), float(np.percentile(mae_samples, 97.5))]
        r2_ci = [float(np.percentile(r2_samples, 2.5)), float(np.percentile(r2_samples, 97.5))]
    else:
        rmse_ci = [rmse, rmse]
        mae_ci = [mae, mae]
        r2_ci = [r2, r2]
        
    return {
        "n_samples": int(n),
        "rmse": round(rmse, 4),
        "rmse_95_ci": [round(x, 4) for x in rmse_ci],
        "mae": round(mae, 4),
        "mae_95_ci": [round(x, 4) for x in mae_ci],
        "r2": round(r2, 4),
        "r2_95_ci": [round(x, 4) for x in r2_ci],
        "pearson_r": round(float(pearson_r), 4),
        "pearson_p": float(pearson_p),
        "spearman_rho": round(float(spearman_rho), 4),
        "spearman_p": float(spearman_p),
    }


def evaluate_predictions(
    test_df: pd.DataFrame,
    y_true_col: str = "pIC50",
    y_pred_col: str = "pred_pIC50",
    output_metrics_json: Path = Path("results/model_metrics.json"),
    output_preds_csv: Path = Path("results/test_predictions.csv")
) -> Dict:
    """Save test predictions and compute comprehensive performance metrics."""
    output_metrics_json.parent.mkdir(parents=True, exist_ok=True)
    output_preds_csv.parent.mkdir(parents=True, exist_ok=True)
    
    y_true = test_df[y_true_col].values
    y_pred = test_df[y_pred_col].values
    
    metrics = compute_regression_metrics(y_true, y_pred)
    
    # Calculate residuals and absolute errors
    test_df["residual"] = test_df[y_pred_col] - test_df[y_true_col]
    test_df["abs_error"] = np.abs(test_df["residual"])
    
    test_df.to_csv(output_preds_csv, index=False)
    
    with open(output_metrics_json, "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Holdout Evaluation: RMSE={metrics['rmse']} (95% CI: {metrics['rmse_95_ci']}), MAE={metrics['mae']}, R2={metrics['r2']}, Spearman={metrics['spearman_rho']}")
    return metrics
