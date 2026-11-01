// Atlas follows the room you're in, and reads the explored rooms the game
// sends with Room.Info when you enter an area.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
if (args.gmcp_method == "Room.Info") {
  var atG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
  client.loom.atlas.roomInfo(atG);
}
