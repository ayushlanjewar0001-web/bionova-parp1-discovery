import hashlib
import json
import lzma
import os
import urllib.request
from pathlib import Path

raw_dir = Path("data/raw")
raw_dir.mkdir(parents=True, exist_ok=True)

url = "https://zenodo.org/api/records/13987985/files/05.7++_combined_set_without_stereochemistry.tsv.xz/content"
xz_file = raw_dir / "05.7++_combined_set_without_stereochemistry.tsv.xz"
extracted_tsv = raw_dir / "papyrus_parp1_raw.tsv"

if not extracted_tsv.exists():
    if not xz_file.exists():
        print("Downloading Papyrus++ archive (54.13 MB)...")
        urllib.request.urlretrieve(url, xz_file)
        print("Download complete.")

    # Calculate SHA256 of downloaded archive
    print("Calculating SHA256 of archive...")
    sha256 = hashlib.sha256()
    with open(xz_file, "rb") as f:
        while chunk := f.read(1024 * 1024):
            sha256.update(chunk)
    archive_hash = sha256.hexdigest()
    print(f"Archive SHA256: {archive_hash}")

    print("Extracting P09874_WT (Human PARP1) records...")
    match_count = 0
    with lzma.open(xz_file, "rt", encoding="utf-8") as f_in, open(extracted_tsv, "w", encoding="utf-8") as f_out:
        header = f_in.readline()
        f_out.write(header)
        header_cols = header.strip().split("\t")
        print(f"Dataset columns ({len(header_cols)}):", header_cols)
        
        target_idx = header_cols.index("target_id") if "target_id" in header_cols else -1
        print(f"'target_id' column index: {target_idx}")
        
        for line in f_in:
            if "P09874_WT" in line:
                cols = line.strip().split("\t")
                if target_idx != -1 and cols[target_idx] == "P09874_WT":
                    f_out.write(line)
                    match_count += 1
                elif target_idx == -1 and "P09874_WT" in line:
                    f_out.write(line)
                    match_count += 1

    print(f"Extraction complete! Found {match_count} raw Human PARP1 records.")
    
    with open(raw_dir / "papyrus_provenance.json", "w", encoding="utf-8") as pf:
        json.dump({
            "source": "Papyrus 2024 (Zenodo 13987985)",
            "file": "05.7++_combined_set_without_stereochemistry.tsv.xz",
            "sha256": archive_hash,
            "target_id": "P09874_WT",
            "target_name": "PARP1_HUMAN",
            "uniprot": "P09874",
            "raw_records_extracted": match_count
        }, pf, indent=2)
else:
    print(f"Raw extracted file {extracted_tsv} already exists.")
