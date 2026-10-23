"""
BioNova PARP1: Backward compatibility shim for RDKit Lead Optimization.
NOTE: Molecular optimization in BioNova PARP1 is performed via RDKit rule-based
medicinal chemistry transformations (bioisosteres, fluorination, tail modulation, rigidification).
For the current module, see bionova_parp1.rdkit_leadopt.
"""

from bionova_parp1.rdkit_leadopt import (
    generate_rdkit_analogs,
    generate_rdkit_analogs as generate_reinvent4_analogs,
    generate_polar_heteroatom_analog,
    generate_fluorine_scan_analog,
    generate_tail_modulation_analog,
    generate_rigidified_analog,
)

__all__ = [
    "generate_rdkit_analogs",
    "generate_reinvent4_analogs",
    "generate_polar_heteroatom_analog",
    "generate_fluorine_scan_analog",
    "generate_tail_modulation_analog",
    "generate_rigidified_analog",
]
