// Atlas follows the room you're in, and reads the explored rooms the game
// sends with Room.Info when you enter an area; Char.Vitals for equilibrium.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
if (args.gmcp_method == "Room.Info") {
  var atG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
  client.loom.atlas.roomInfo(atG);
} else if (args.gmcp_method == "Char.Vitals") {
  // Equilibrium, for warps on a walk.
  var atV = args.gmcp_args;
  if (typeof atV === "string") { try { atV = JSON.parse(atV); } catch (e) { atV = null; } }
  if (atV && typeof atV == "object" && atV.eq !== undefined) client.loom.atlas.vitals(atV);
}
