if (!client.loom) client.loom = {};
if (!client.loom.loom) client.loom.loom = {};
var L = client.loom.loom;

if (args.gmcp_method == "Room.Info") {
  var g = args.gmcp_args;
  L.room = { id: g.num, name: g.name, area: g.area, environment: g.environment };
}

// Once a session, at the first class message (every package has loaded by
// then): say if anything here is out of date. Silent otherwise.
if (args.gmcp_method == "Char.Status" && !L.updatesChecked) {
  L.updatesChecked = true;
  if ((get_variable("loom_autoupdates") || "on") == "on") {
    set_variable("loom_updates_mode", "auto");
    run_function("loom_updates", [], "loom");
  }
}

if (args.gmcp_method == "Char.Status" && args.gmcp_args.class) {
  var cls = args.gmcp_args.class;
  if (cls != L.cls) {
    L.cls = cls;
    display_notice("[loom] class: " + cls, "cyan");
  }
}
