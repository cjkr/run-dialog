#!/bin/bash

# Variables
APP_NAME="simple-run-dialog"
TARGET_DIR="$HOME/.local/bin"
SCRIPT_NAME="run-dialog.js"

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
