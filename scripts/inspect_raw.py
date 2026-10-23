import pandas as pd

df = pd.read_csv("data/raw/papyrus_parp1_raw.tsv", sep="\t", low_memory=False)
print("Columns:", df.columns.tolist())
print("\nFirst 3 rows:")
for col in ['Activity_ID', 'Quality', 'type_IC50', 'type_EC50', 'type_KD', 'type_Ki', 'type_other', 'relation', 'pchembl_value_Median']:
    if col in df.columns:
        print(f"{col}: {df[col].head(3).tolist()} | value_counts:\n{df[col].value_counts(dropna=False).head(5)}")
