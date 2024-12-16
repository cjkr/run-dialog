imports.gi.versions.Gtk = "3.0";
const { Gio, GLib, Gtk, Gdk } = imports.gi;

Gtk.init(null);

class RunDialog {
  constructor() {
    this._buildUI();
  }

  _buildUI() {
    this.window = new Gtk.Window({
      default_width: 400,
      default_height: 100,
    });

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

    this.entry = new Gtk.Entry();
    this.entry.set_margin_top(10);
    this.entry.set_margin_bottom(10);
    this.entry.set_margin_start(10);
    this.entry.set_margin_end(10);

    // Overlay to display placeholder text
    this.placeholder = new Gtk.Label({
      label: "Enter a command...",
      halign: Gtk.Align.START,
      valign: Gtk.Align.CENTER,
      opacity: 0.5, // Make placeholder text slightly transparent
      margin_start: 15, // Adjust alignment within the overlay
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
      spacing: 10,
      margin: 10,
    });

    vbox.pack_start(overlay, true, true, 0);
    vbox.pack_start(this.completionLabel, false, false, 0);

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
