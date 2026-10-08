if (!client.loom) client.loom = {};
if (!client.loom.loom) client.loom.loom = {};
var L = client.loom.loom;

if (args.gmcp_method == "Room.Info") {
  var g = args.gmcp_args;
  L.room = { id: g.num, name: g.name, area: g.area, environment: g.environment };

  // LEGACY shared variables. Packages that have not had their v0.2 pass still
  // read these. Removed once none does (issue #2).
  set_variable("currentRoomId", g.num);
  set_variable("currentRoomName", g.name);
  set_variable("currentArea", g.area);
  set_variable("currentEnvironment", g.environment);
}

if (args.gmcp_method == "Char.Status" && args.gmcp_args.class) {
  var cls = args.gmcp_args.class;
  if (cls != get_variable("activeClass")) {
    // LEGACY shared variable, same as above.
    set_variable("activeClass", cls);
    L.cls = cls;
    display_notice("[loom] class: " + cls, "green");

    // LEGACY: tells roleplay to reload its emotes, only when roleplay's
    // engine exists (otherwise AEM RELOAD would reach the game). Goes away
    // when roleplay follows the class itself.
    if (window.AEM) send_command("aem reload");
  }
}
