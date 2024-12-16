#!/usr/bin/env gjs

imports.gi.versions.Gtk = "3.0";
const { Gio, GLib, Gtk, Gdk, GObject } = imports.gi;

Gtk.init(null);

class RunDialog {
  constructor() {
    // Set the user's home directory as PWD
    try {
      GLib.chdir(GLib.get_home_dir());
      print(`Current working directory set to: ${GLib.get_home_dir()}`);
    } catch (error) {
      print(`Failed to set working directory: ${error.message}`);
    }

    this._currentSuggestions = []; // Initialize as an empty array
    this._currentIndex = -1; // Initialize the index
    this._lastInput = ""; // Track the last input text
    this._createRunDialog();
  }

  _createRunDialog() {
    this.window = new Gtk.Window();

    // Set properties for "run dialog" behavior
    this.window.set_decorated(false); // Remove titlebar
    this.window.set_skip_taskbar_hint(true); // Hide from taskbar
    this.window.set_type_hint(Gdk.WindowTypeHint.DIALOG); // Dialog-type behavior
    this.window.set_keep_above(true); // Always on top
    this.window.set_position(Gtk.WindowPosition.CENTER);

    // Handle ESC key to close the app
    this.window.connect("key-press-event", (widget, event) => {
      if (event.get_keyval()[1] === Gdk.KEY_Escape) {
        Gtk.main_quit();
        return true;
      }
      return false;
    });

    let margin = 3;

    // Create entry
    this.entry = new Gtk.Entry();
    this.entry.set_margin_top(margin);
    this.entry.set_margin_bottom(margin);
    this.entry.set_margin_start(margin);
    this.entry.set_margin_end(margin);
    this.entry.set_halign(Gtk.Align.CENTER);
    this.entry.set_valign(Gtk.Align.CENTER);
    this.entry.set_width_chars(40);

    // Apply monospace font and font size
    const cssProvider = new Gtk.CssProvider();
    cssProvider.load_from_data(`
          window {
            border-radius: 5px; /* Round the corners of the window */
            background-color: #333333; /* Optional: Add a subtle background color */
          }
          entry {
            font-family: "Fira Code", monospace;
            font-size: 12px;
            padding: 0px;
            padding-left: 5px;
            border-radius: 3px; /* Round the corners of the entry box */
            border: 1px solid #3daee9; /* Optional: Add a border for the entry */
            background-color:rgba(18, 18, 18, 0.79);
            color:rgb(206, 206, 206);
          }
          label {
            font-family: "Fira Code", monospace;
            font-size: 12px;
            font-weight: 300; /* Light font */
            color: #f7f7f7; /* Slightly transparent gray */
            padding-left: 5px; /* Align with entry text */
          }
        `);
    Gtk.StyleContext.add_provider_for_screen(
      Gdk.Screen.get_default(),
      cssProvider,
      Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );

    // Overlay to display placeholder text
    this.placeholder = new Gtk.Label({
      label: " Enter a command...",
      halign: Gtk.Align.START,
      valign: Gtk.Align.CENTER,
      name: "placeholder", // Add a style class for targeted CSS,
      opacity: 0.4,
    });

    let overlay = new Gtk.Overlay();
    overlay.add(this.entry);
    overlay.add_overlay(this.placeholder);

    // Update placeholder visibility based on input
    this.entry.connect("changed", () => {
      this.placeholder.set_visible(this.entry.get_text().trim() === "");
    });

    // Ensure placeholder visibility when the dialog is shown
    this.placeholder.set_visible(true);

    // Handle keyboard events for cycling and input
    this.entry.connect("key-press-event", (widget, event) => {
      const keyVal = event.get_keyval()[1];

      // TAB: Cycle forwards
      if (keyVal === Gdk.KEY_Tab) {
        this._cycleSuggestions(widget, 1); // Forward
        return true; // Prevent default Tab behavior
      }

      // SHIFT+TAB: Cycle backwards
      if (
        keyVal === Gdk.KEY_ISO_Left_Tab ||
        (event.get_state() & Gdk.ModifierType.SHIFT_MASK &&
          keyVal === Gdk.KEY_Tab)
      ) {
        this._cycleSuggestions(widget, -1); // Backward
        return true;
      }

      // Backspace/Delete: Let default handling occur
      if (keyVal === Gdk.KEY_BackSpace || keyVal === Gdk.KEY_Delete) {
        this._updateSuggestions(widget.get_text().trim());
        return false; // Allow normal behavior
      }

      // Alphanumerics and special characters: Append to inputText
      if (this._isPrintableKey(keyVal)) {
        GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
          this._updateSuggestions(widget.get_text().trim());
          return GLib.SOURCE_REMOVE; // Ensure the idle callback is removed after execution
        });
      }

      return false; // Allow default behavior for other keys
    });

    let vbox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      halign: Gtk.Align.CENTER,
      valign: Gtk.Align.CENTER,
      spacing: 0,
    });

    vbox.pack_start(overlay, false, false, 0);

    this.window.add(vbox);

    // Connect signals
    this.entry.connect("activate", () => this._onCommandEntered());
    this.window.connect("destroy", Gtk.main_quit);

    this.window.show_all();
  }

  _isPrintableKey(keyVal) {
    // Allow alphanumeric and basic special characters
    return (
      (keyVal >= Gdk.KEY_space && keyVal <= Gdk.KEY_asciitilde) || // Printable ASCII
      (keyVal >= Gdk.KEY_exclam && keyVal <= Gdk.KEY_slash) // Special keys (e.g., !, ?)
    );
  }

  _updateSuggestions(input) {
    if (input.length === 0 || input === this._lastInput) return;

    // Generate new suggestions
    this._currentSuggestions = Array.from(
      new Set([
        ...this._getFilePathSuggestions(input),
        ...this._getCommandSuggestions(input),
      ])
    ).sort();

    this._currentIndex = -1; // Reset the cycling index
    this._lastInput = input; // Update last input
  }

  _cycleSuggestions(entry, direction) {
    if (this._currentSuggestions.length === 0) return;

    // Update index based on cycling direction (1: forward, -1: backward)
    this._currentIndex =
      (this._currentIndex + direction + this._currentSuggestions.length) %
      this._currentSuggestions.length;

    const suggestion = this._currentSuggestions[this._currentIndex];
    entry.set_text(suggestion);
    entry.set_position(suggestion.length); // Move cursor to the end
  }

  _getFilePathSuggestions(prefix) {
    const suggestions = [];
    let baseDir = GLib.get_home_dir(); // Default to home directory

    if (prefix.startsWith("~")) {
      baseDir = GLib.get_home_dir();
      prefix = prefix.slice(1); // Remove '~'
    } else if (prefix.startsWith("/")) {
      baseDir = "/";
    } else if (prefix.includes("/")) {
      const parts = prefix.split("/");
      baseDir = GLib.build_filenamev(parts.slice(0, -1));
      prefix = parts.slice(-1)[0];
    }

    try {
      const dir = Gio.File.new_for_path(baseDir);
      const enumerator = dir.enumerate_children(
        "standard::name",
        Gio.FileQueryInfoFlags.NONE,
        null
      );

      let fileInfo;
      while ((fileInfo = enumerator.next_file(null))) {
        const name = fileInfo.get_name();
        if (name.startsWith(prefix)) {
          suggestions.push(GLib.build_filenamev([baseDir, name]));
        }
      }
    } catch (e) {
      print(`Error enumerating directory: ${e.message}`);
    }

    print(`File Suggestions for '${prefix}': ${JSON.stringify(suggestions)}`);
    return suggestions;
  }

  _getCommandSuggestions(prefix) {
    const suggestions = [];
    const pathDirs = GLib.getenv("PATH").split(":");

    for (const dir of pathDirs) {
      try {
        const dirFile = Gio.File.new_for_path(dir);
        const enumerator = dirFile.enumerate_children(
          "standard::name",
          Gio.FileQueryInfoFlags.NONE,
          null
        );

        let fileInfo;
        while ((fileInfo = enumerator.next_file(null))) {
          const name = fileInfo.get_name();
          if (name.startsWith(prefix)) {
            suggestions.push(name);
          }
        }
      } catch (e) {
        // Skip directories that cannot be enumerated
      }
    }

    print(
      `Command Suggestions for '${prefix}': ${JSON.stringify(suggestions)}`
    );
    return suggestions;
  }

  _onCommandEntered() {
    let input = this.entry.get_text().trim();
    if (input.length === 0) return;

    // Expand home directory (~) or relative paths
    let expandedPath = GLib.build_filenamev([
      GLib.get_home_dir(),
      input.replace(/^~\//, "").replace(/^\.\//, ""),
    ]);

    try {
      // Check if the input is a valid file or directory
      if (GLib.file_test(expandedPath, GLib.FileTest.IS_DIR)) {
        // Input is a folder - open with default file manager
        let folderUri = Gio.File.new_for_path(expandedPath).get_uri();
        Gio.app_info_launch_default_for_uri(folderUri, null);
      } else if (GLib.file_test(expandedPath, GLib.FileTest.IS_REGULAR)) {
        // Input is a file - open with default application
        let fileUri = Gio.File.new_for_path(expandedPath).get_uri();
        Gio.app_info_launch_default_for_uri(fileUri, null);
      } else {
        // Input is neither a file nor a folder - treat as command
        GLib.spawn_command_line_async(input);
      }
      Gtk.main_quit(); // Close the app on successful execution
    } catch (error) {
      // Handle invalid commands or errors
      print(`Error: ${error.message}`);
    }

    this.entry.set_text(""); // Clear the entry
  }
}

new RunDialog();
Gtk.main();
