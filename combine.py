import os
from pathlib import Path

def combine_files(source_dir=".", output_filename="combined_code.txt"):
    # Folders to skip to avoid bloat and build artifacts
    ignore_dirs = {'node_modules', 'dist', 'build', '.git', '.next', 'out', 'coverage'}
    
    source_path = Path(source_dir).resolve()
    output_path = Path(output_filename).resolve()
    
    combined_count = 0
    
    print(f"Scanning '{source_path}' for .ts and .tsx files...")
    
    with open(output_path, 'w', encoding='utf-8') as outfile:
        for file_path in source_path.rglob('*'):
            # Skip if any parent directory of the file is in the ignore list
            if any(part in ignore_dirs for part in file_path.parts):
                continue
                
            # Only process file if it is a .ts or .tsx file
            if file_path.is_file() and file_path.suffix in ['.ts', '.tsx']:
                # Avoid reading the output file itself if it falls into the criteria
                if file_path == output_path:
                    continue
                
                # Get path relative to the root directory for a cleaner header
                try:
                    relative_path = file_path.relative_to(source_path)
                except ValueError:
                    relative_path = file_path
                
                # Write a clear separator and header for the LLM
                outfile.write(f"\n{'='*80}\n")
                outfile.write(f"FILE: {relative_path}\n")
                outfile.write(f"{'='*80}\n\n")
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as infile:
                        outfile.write(infile.read())
                    combined_count += 1
                except Exception as e:
                    outfile.write(f"[ERROR READING FILE: {e}]\n")
                
                outfile.write("\n")
                
    print(f"Successfully combined {combined_count} files into '{output_filename}'.")

if __name__ == "__main__":
    combine_files()