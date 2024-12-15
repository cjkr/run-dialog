# Run Dialog Standalone App

This is a lightweight standalone implementation of the Cinnamon Run Dialog. It allows you to run commands with minimal dependencies, featuring a simple GTK-based interface.

## Features
- Run system commands from a minimal dialog.
- Compatible with Arch Linux and most GNOME-based desktop environments.
- Lightweight and easy to use.

## Requirements
- **Arch Linux** or a similar Linux distribution.
- **Dependencies**:
  - `gjs`
  - `gtk3`

Install these dependencies on Arch Linux:
```bash
sudo pacman -S gjs gtk3
```

## Installation
Clone the repository:
```bash
git clone https://github.com/yourusername/run-dialog.git
cd run-dialog
```

Run the script:
```bash
gjs run-dialog.js
```

Optionally, make the script executable:
```bash
chmod +x run-dialog.js
./run-dialog.js
```

## Usage
1. Run the script using `gjs run-dialog.js` or `./run-dialog.js`.
2. Enter a command in the input field (e.g., `ls`, `xdg-open https://example.com`).
3. Press Enter to execute.

## Contributing
Feel free to fork this repository and submit pull requests for improvements.

## License
This project is licensed under the [MIT License](LICENSE).
