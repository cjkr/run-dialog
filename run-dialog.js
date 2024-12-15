imports.gi.versions.Gtk = "3.0";
const { Gio, GLib, Gtk } = imports.gi;

Gtk.init(null);

class RunDialog {
  constructor() {
    this._buildUI();
  }

  _buildUI() {
    this.window = new Gtk.Window({
      title: "Run a Command",
      default_width: 400,
      default_height: 100,
    });

    this.window.set_position(Gtk.WindowPosition.CENTER);

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
      this.completionLabel.set_text("Command executed: " + command);
      this.completionLabel.set_visible(true);
    } catch (error) {
      this.completionLabel.set_text("Error: " + error.message);
      this.completionLabel.set_visible(true);
    }

    this.entry.set_text("");
  }
}

new RunDialog();
Gtk.main();
