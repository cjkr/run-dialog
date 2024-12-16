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

    this.entry = new Gtk.Entry({ placeholder_text: "Enter a command..." });
    this.completionLabel = new Gtk.Label({ visible: false });

    let vbox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 10,
      margin: 10,
    });

    vbox.pack_start(this.entry, true, true, 0);
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
      this.completionLabel.set_text("Error: " + error.message);
      this.completionLabel.set_visible(true);
    }

    this.entry.set_text("");
  }
}

new RunDialog();
Gtk.main();
