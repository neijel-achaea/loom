// Sigils follows the room and the city itself.
if (!client.loom) client.loom = {};
if (!client.loom.sigils) client.loom.sigils = {};
var S = client.loom.sigils;

if (args.gmcp_method == "Char.Status" && args.gmcp_args.city) {
  S.city = String(args.gmcp_args.city).replace(/\s*\(.*\)\s*$/, "");
}

if (args.gmcp_method == "Room.Info") {
  S.room = { id: args.gmcp_args.num, name: args.gmcp_args.name };
  run_function("sigils_enter", [], "sigils");
}
