// Sigils follows the room and the city itself.
if (!client.loom) client.loom = {};
if (!client.loom.sigils) client.loom.sigils = {};
var S = client.loom.sigils;
// A payload that came empty or as something other than an object reads as
// an empty one (#135).
var sgG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};

if (args.gmcp_method == "Char.Status" && sgG.city) {
  S.city = String(sgG.city).replace(/\s*\(.*\)\s*$/, "");
}

if (args.gmcp_method == "Room.Info") {
  S.room = { id: sgG.num, name: sgG.name };
  run_function("sigils_enter", [], "sigils");
}
