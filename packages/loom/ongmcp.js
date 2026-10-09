if (!client.loom) client.loom = {};
if (!client.loom.loom) client.loom.loom = {};
var L = client.loom.loom;

if (args.gmcp_method == "Room.Info") {
  var g = args.gmcp_args;
  L.room = { id: g.num, name: g.name, area: g.area, environment: g.environment };
}

if (args.gmcp_method == "Char.Status" && args.gmcp_args.class) {
  var cls = args.gmcp_args.class;
  if (cls != L.cls) {
    L.cls = cls;
    display_notice("[loom] class: " + cls, "green");
  }
}
