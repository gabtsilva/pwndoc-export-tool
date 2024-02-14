#!/bin/bash
. ./config.file

encrypt_file() {
    local file="$1"
    local relative_path="${file#$directory/}"
    local output_path="$output_folder/$relative_path"
	mkdir -p "$(dirname "$output_path")"
    	gpg --encrypt --recipient "$firstRecipient" --recipient "$secondRecipient" --recipient "$thirdRecipient" --output "$output_path.gpg" "$file"
}

encrypt_directory() {
    local directory="$1"
    for file in "$directory"/*; do
	    if [[ -f "$file" ]]; then
            encrypt_file "$file"
        elif [[ -d "$file" ]]; then
            encrypt_directory "$file"
        fi
    done
}

main() {
    local directory="$1"
    if [[ ! -d "$directory" ]]; then
        echo "Error: $directory is not a valid directory."
        exit 1
    fi
    
    directory_structure=$(find "$directory" -type d)
    
    for dir in $directory_structure; do
        relative_path="${dir#$directory/}"
        mkdir -p "$output_folder/$relative_path"
    done
    
    # Encrypt files in the input directory and its sub-directories
    encrypt_directory "$directory"
}

# Check for correct number of arguments
if [[ "$#" -ne 1 ]]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

output_folder="encrypted_files"
mkdir -p "$output_folder"

# Get the directory of the script
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Call the main function with the provided arguments
main "$1"
