// Gathering follows the room and the prompt itself.
if (!client.loom || !client.loom.gathering || !client.loom.gathering.envs) run_function("gathering_setup", [], "gathering");
var GA = client.loom.gathering;
var gaG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
if (args.gmcp_method == "Room.Info") GA.room(gaG.environment);
else if (args.gmcp_method == "Char.Vitals" && GA.on) {
  GA.bal = gaG.bal != "0";
  GA.eq = gaG.eq != "0";
  // After the packet's own lines, so a success line is seen first.
  setTimeout(GA.prompt, 0);
}
