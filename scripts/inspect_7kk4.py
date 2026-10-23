from pathlib import Path
from collections import Counter

pdb_path = Path("data/interim/7KK4.pdb")
hetatms = Counter()
chains = set()

with open(pdb_path, "r", encoding="utf-8") as f:
    for line in f:
        if line.startswith("ATOM"):
            chains.add(line[21:22])
        elif line.startswith("HETATM"):
            resname = line[17:20].strip()
            chain = line[21:22]
            hetatms[(chain, resname)] += 1

print("Protein chains found:", sorted(list(chains)))
print("HETATMs found in 7KK4:")
for (chain, resname), count in hetatms.most_common(20):
    print(f"  Chain: {chain} | Residue: {resname} | Count: {count}")
