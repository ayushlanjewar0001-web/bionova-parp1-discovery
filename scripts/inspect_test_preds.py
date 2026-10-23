import pandas as pd

df_pred = pd.read_csv("models/chemprop_parp1/model_0/test_predictions.csv")
print("Pred head:\n", df_pred.head())
df_test = pd.read_csv("splits/test.csv")
print("Test head:\n", df_test[["compound_id", "smiles", "pIC50"]].head())

# Check if SMILES order matches
print("SMILES match exactly in order?", (df_pred["smiles"] == df_test["smiles"]).all())
if not (df_pred["smiles"] == df_test["smiles"]).all():
    print("Merging on SMILES...")
    merged = pd.merge(df_test, df_pred, on="smiles", suffixes=("_true", "_pred"))
    print("Merged head:\n", merged.head())
