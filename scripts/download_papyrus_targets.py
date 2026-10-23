import json
import lzma
import os
import urllib.request
from pathlib import Path

data_raw = Path("data/raw")
data_raw.mkdir(parents=True, exist_ok=True)

# 1. Download README.txt
readme_url = "https://zenodo.org/api/records/13987985/files/README.txt/content"
readme_path = data_raw / "Papyrus_2024_README.txt"
if not readme_path.exists():
    print("Downloading Papyrus README.txt...")
    urllib.request.urlretrieve(readme_url, readme_path)
    print("Downloaded README.txt")

with open(readme_path, "r", encoding="utf-8", errors="ignore") as f:
    readme_head = "".join([f.readline() for _ in range(35)])
    print("=== README HEAD ===")
    print(readme_head)

# 2. Download protein targets table
targets_url = "https://zenodo.org/api/records/13987985/files/05.7_combined_set_protein_targets.tsv.xz/content"
targets_xz_path = data_raw / "05.7_combined_set_protein_targets.tsv.xz"
targets_tsv_path = data_raw / "05.7_combined_set_protein_targets.tsv"

if not targets_tsv_path.exists():
    if not targets_xz_path.exists():
        print("Downloading 05.7_combined_set_protein_targets.tsv.xz (1.7 MB)...")
        urllib.request.urlretrieve(targets_url, targets_xz_path)
        print("Downloaded targets xz.")
    
    print("Decompressing targets...")
    with lzma.open(targets_xz_path, "rt", encoding="utf-8") as f_in, open(targets_tsv_path, "w", encoding="utf-8") as f_out:
        shutil_chunk = f_in.read(1024 * 1024)
        while shutil_chunk:
            f_out.write(shutil_chunk)
            shutil_chunk = f_in.read(1024 * 1024)
    print("Decompressed targets tsv.")

# Search for P09874 / PARP1
print("\nSearching for PARP1 (P09874)...")
with open(targets_tsv_path, "r", encoding="utf-8") as f:
    header = f.readline().strip().split("\t")
    print("Header:", header)
    for line in f:
        if "P09874" in line or "PARP1" in line.upper():
            print("Found target record:", line.strip())
