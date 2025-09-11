import os
import subprocess as sp
import zipfile
import sys
from PyInstaller import __main__ as pyinstaller

if __name__ == "__main__":
    if not "--onlyzip" in sys.argv:
        # Build frontend first
        sp.run(args="npm run build", shell=True, cwd="frontend")

        # Build distributable
        pyinstaller.run([
            '--name=mechaleague_mms',
            f'--add-data=frontend/dist{os.pathsep}frontend/dist',
            '-y',
            'main.py'
        ])

    # Zip the dist folder
    dist_dir = "dist"
    zipf = zipfile.ZipFile('mechaleague_mms.zip', 'w', zipfile.ZIP_DEFLATED)
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            zipf.write(os.path.join(root, file),
                       os.path.relpath(os.path.join(root, file),
                                       os.path.join(dist_dir, '..')))