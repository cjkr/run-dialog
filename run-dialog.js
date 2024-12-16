imports.gi.versions.Gtk = "3.0";
const { Gio, GLib, Gtk, Gdk } = imports.gi;

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

    this._buildUI();
  }

  _buildUI() {
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

    let margin = 8;

    this.entry = new Gtk.Entry();
    this.entry.set_margin_top(margin);
    this.entry.set_margin_bottom(margin);
    this.entry.set_margin_start(margin);
    this.entry.set_margin_end(margin);
    this.entry.set_halign(Gtk.Align.CENTER);
    this.entry.set_valign(Gtk.Align.CENTER);
    this.entry.set_width_chars(30);

    // Apply monospace font and font size
    const cssProvider = new Gtk.CssProvider();
    cssProvider.load_from_data(`
            entry {
              font-family: "Fira Code", monospace;
              font-size: 16px;
              padding: 5px;
            }
            .placeholder {
              font-family: "Fira Code", monospace;
              font-size: 16px;
              font-weight: 300; /* Light font */
              color: rgb(0, 0, 0); /* Slightly transparent gray */
              padding-left: 200px; /* Align with entry text */
            }
        `);
    Gtk.StyleContext.add_provider_for_screen(
      Gdk.Screen.get_default(),
      cssProvider,
      Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );

    // Overlay to display placeholder text
    this.placeholder = new Gtk.Label({
      label: "       Enter a command...",
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

    this.completionLabel = new Gtk.Label({ visible: false });

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

  _onCommandEntered() {
    let command = this.entry.get_text().trim();
    if (command.length === 0) return;

    try {
      GLib.spawn_command_line_async(command);
      Gtk.main_quit(); // Close the app on successful execution
    } catch (error) {
      // Handle invalid commands or errors
      this.completionLabel.set_text("Error: " + error.message);
      this.completionLabel.set_visible(true);
    }

    this.entry.set_text(""); // Clear the entry
  }
}

new RunDialog();
Gtk.main();
