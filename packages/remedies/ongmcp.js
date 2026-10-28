// Remedies follows balance and equilibrium, and steps a run at each prompt.
var rmR = client.loom && client.loom.remedies;
if (rmR && rmR.run && args.gmcp_method == "Char.Vitals") {
  var rmG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
  rmR.bal = rmG.bal != "0";
  rmR.eq = rmG.eq != "0";
  // After the packet's own lines, so an answer is seen first.
  setTimeout(rmR.prompt, 0);
}
