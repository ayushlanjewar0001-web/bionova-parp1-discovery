import chemprop
print("Chemprop version:", chemprop.__version__)
print("Chemprop attributes:", [x for x in dir(chemprop) if not x.startswith("_")])
