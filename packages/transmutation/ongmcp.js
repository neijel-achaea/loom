// Transmutation follows the room and the prompt itself.
if (!client.loom || !client.loom.transmutation || !client.loom.transmutation.envs) run_function("transmutation_setup", [], "transmutation");
var TR = client.loom.transmutation;
var trG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
if (args.gmcp_method == "Room.Info") TR.enter(trG);
else if (args.gmcp_method == "Char.Vitals") {
  TR.bal = trG.bal != "0";
  TR.eq = trG.eq != "0";
  // After the packet's own lines, so MINERALS and "You store" are seen first.
  setTimeout(TR.prompt, 0);
}
