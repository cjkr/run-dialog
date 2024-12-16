# Run Dialog Standalone App

This is a lightweight standalone implementation of the Cinnamon Run Dialog, written in GJS (GNOME JavaScript). The app allows you to quickly open files, folders, or execute commands in a minimal, user-friendly interface.

## Features
- Open files with their default applications.
- Open folders with the default file manager.
- Run system commands from a minimal dialog.
- Compatible with Arch Linux and most GNOME-based desktop environments.
- Placeholder text styled for clarity and aesthetics.
- Lightweight and easy to use.

## Requirements
- A Linux distribution with GJS installed.
- Recommended: GTK 3.0 or later.

### Installing GJS on Arch Linux
Run the following command:
```bash
sudo pacman -S gjs gtk3
```

## Usage
### Making the Script Executable
Ensure the script is executable by adding the shebang (`#!/usr/bin/env gjs`) at the top and running:
```bash
chmod +x run-dialog.js
```

### Running the App
You can run the app directly:
```bash
./run-dialog.js
```

### Setting the Script Globally
To make the script globally accessible:
1. Move the script to a directory in your `PATH`, such as `/usr/local/bin/`:
   ```bash
   sudo mv run-dialog.js /usr/local/bin/run-dialog
   ```
2. Now you can run it from anywhere:
   ```bash
   run-dialog
   ```

## Example Scenarios
- **Open a Folder:**
  Type a folder name like `~/Documents` or `.config` and press Enter. The folder will open in the default file manager.
- **Open a File:**
  Type a file name like `.bashrc` or `~/example.txt` and press Enter. The file will open with the default application.
- **Execute a Command:**
  Type a shell command like `ls`, `mkdir test`, or `xdg-open .` and press Enter. The command will be executed.

## Known Issues
- Some KDE users might see harmless debug messages related to `kf.kio.core.connection`. These do not affect functionality.
- Ensure the file or folder paths are correct and accessible.

## Contributing
Feel free to fork this repository and submit pull requests for improvements.

## License
This project is licensed under the [MIT License](LICENSE).
