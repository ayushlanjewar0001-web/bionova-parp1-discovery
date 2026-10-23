import json
from pathlib import Path
import pandas as pd

full_df = pd.read_csv("data/processed/parp1_regression.csv")
train_df = pd.read_csv("splits/train.csv")
val_df = pd.read_csv("splits/val.csv")
test_df = pd.read_csv("splits/test.csv")

train_smiles = set(train_df["smiles"])
val_smiles = set(val_df["smiles"])
test_smiles = set(test_df["smiles"])

train_indices = []
val_indices = []
test_indices = []

for idx, smi in enumerate(full_df["smiles"]):
    if smi in train_smiles:
        train_indices.append(idx)
    elif smi in val_smiles:
        val_indices.append(idx)
    elif smi in test_smiles:
        test_indices.append(idx)

print(f"Total rows: {len(full_df)}")
print(f"Train indices: {len(train_indices)}, Val: {len(val_indices)}, Test: {len(test_indices)}")
assert len(train_indices) + len(val_indices) + len(test_indices) == len(full_df)

chemprop_splits = [{
    "train": train_indices,
    "val": val_indices,
    "test": test_indices
}]

out_path = Path("splits/chemprop_splits.json")
with open(out_path, "w") as f:
    json.dump(chemprop_splits, f)

print(f"Saved ChemProp v2 split file: {out_path}")
