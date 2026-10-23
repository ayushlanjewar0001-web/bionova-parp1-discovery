import io
import shutil
import urllib.request
import zipfile
from pathlib import Path

bin_dir = Path("bin")
bin_dir.mkdir(parents=True, exist_ok=True)
vina_exe = bin_dir / "vina.exe"

if not vina_exe.exists():
    url = "https://github.com/ccsb-scripps/AutoDock-Vina/releases/download/v1.2.5/vina_1.2.5_windows_x86_64.zip"
    print(f"Downloading AutoDock Vina 1.2.5 binary from {url}...")
    req = urllib.request.Request(url, headers={"User-Agent": "BioNova-PARP1/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
    print("Download complete. Extracting vina.exe...")
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        for member in z.namelist():
            if member.endswith("vina.exe"):
                with z.open(member) as src, open(vina_exe, "wb") as dst:
                    shutil.copyfileobj(src, dst)
                print(f"Extracted {vina_exe}")
                break
    if not vina_exe.exists():
        # Maybe named vina_1.2.5_windows_x86_64.exe
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            for member in z.namelist():
                if member.endswith(".exe"):
                    with z.open(member) as src, open(vina_exe, "wb") as dst:
                        shutil.copyfileobj(src, dst)
                    print(f"Extracted {member} to {vina_exe}")
                    break

print(f"Vina binary verification: exists={vina_exe.exists()}, size={vina_exe.stat().st_size if vina_exe.exists() else 0}")
