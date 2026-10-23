from meeko import MoleculePreparation, PDBQTWriterLegacy
from rdkit import Chem
from rdkit.Chem import AllChem

smi = "CC(=O)Oc1ccccc1C(=O)O"
mol = Chem.MolFromSmiles(smi)
mol = Chem.AddHs(mol)
AllChem.EmbedMolecule(mol)

prep = MoleculePreparation()
mol_setups = prep.prepare(mol)
pdbqt_str, is_ok, err_msg = PDBQTWriterLegacy.write_string(mol_setups[0])
print(f"PDBQTWriterLegacy success: is_ok={is_ok}, len={len(pdbqt_str)}")
