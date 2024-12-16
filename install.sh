#!/bin/bash

# Variables
APP_NAME="simple-run-dialog"
TARGET_DIR="$HOME/.local/bin"
SCRIPT_NAME="run-dialog.js"
DEPENDENCIES=("gjs" "gtk3")

# Function to check dependencies
check_dependencies() {
    echo "Checking dependencies..."
    for dep in "${DEPENDENCIES[@]}"; do
        if ! command -v $dep &> /dev/null; then
            echo "Dependency $dep is not installed."
            read -p "Would you like to install $dep? [Y/n]: " choice
            if [[ "$choice" =~ ^[Yy]$ || -z "$choice" ]]; then
                if command -v pacman &> /dev/null; then
                    sudo pacman -S $dep
                elif command -v apt &> /dev/null; then
                    sudo apt install $dep
                elif command -v dnf &> /dev/null; then
                    sudo dnf install $dep
                else
                    echo "Unsupported package manager. Please install $dep manually."
                    exit 1
                fi
            else
                echo "Dependency $dep is required. Exiting installation."
                exit 1
            fi
        fi
    done
    echo "All dependencies are installed."
}

# Check for dependencies
check_dependencies

# Ensure the target directory exists
mkdir -p "$TARGET_DIR"

# Copy the script to the target directory
cp "$SCRIPT_NAME" "$TARGET_DIR/$APP_NAME"

# Make the script executable
chmod +x "$TARGET_DIR/$APP_NAME"

# Add ~/.local/bin to PATH if not already included
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
    echo "Added $HOME/.local/bin to PATH. Please restart your terminal or run 'source ~/.bashrc' to apply."
fi

echo "Installation complete. You can now run the app using the command: $APP_NAME"
