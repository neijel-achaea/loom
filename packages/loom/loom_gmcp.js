// loom_gmcp -- the work behind onGMCP, as a function made once per load
// (client.loom.hooks.loom.gmcp). Nexus compiles a script afresh every time it
// runs, and long ones cost on every GMCP message, so the script itself stays two
// lines and calls this (#136). Run from onLoad and onInstall, so a reimport
// replaces it.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.loom) client.loom.hooks.loom = {};
client.loom.hooks.loom.gmcp = function (args) {
  if (!client.loom) client.loom = {};
  if (!client.loom.loom) client.loom.loom = {};
  var L = client.loom.loom;
  // A payload that came empty or as something other than an object reads as
  // an empty one (#135).
  var lmG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};

  if (args.gmcp_method == "Room.Info") {
    var g = lmG;
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

  if (args.gmcp_method == "Char.Status" && lmG.class) {
    var cls = lmG.class;
    if (cls != L.cls) {
      L.cls = cls;
      display_notice("[loom] class: " + cls, "cyan");
    }
  }

  // The city, for tab themes (#310). Char.Status carries it at login.
  if (args.gmcp_method == "Char.Status" && lmG.city !== undefined) {
    if (!L.themeSeeCity) run_function("loom_theme", [], "loom");
    L.themeSeeCity(lmG.city);
  }
};
