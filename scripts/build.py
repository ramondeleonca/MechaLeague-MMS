from PyInstaller import __main__ as pyinstaller
import os

if __name__ == "__main__":
    args = [
        '--name=mechaleague_mms',
        # '--onefile',
        # '--windowed',  # Use --noconsole for no console window
        f'--add-data=frontend/dist{os.pathsep}frontend/dist',  # Include frontend files
        '-y'
    ]

    # Add frontend files recursively
    # frontend_dir = os.path.join('frontend', 'dist')

    # if os.path.exists(frontend_dir):
    #     for root, dirs, files in os.walk(frontend_dir):
    #         for file in files:
    #             file_path = os.path.join(root, file)
    #             args.append(f"--add-data={file_path}{os.pathsep}{os.path.relpath(root, frontend_dir)}")

    # Add the main script
    args.append('main.py')

    print(f"Building with arguments: {args}")

    pyinstaller.run(args)