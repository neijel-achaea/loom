// onGMCP: only the prompt matters (Char.Vitals): its health at once, the rest
// after the packet's own lines.
if (args.gmcp_method == "Char.Vitals") {
  if (!client.loom || !client.loom.ripples || !client.loom.ripples.prompt) run_function("ripples_setup", [], "ripples");
  var rgV = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
  if (client.loom.ripples.run) client.loom.ripples.vitals(rgV);
  setTimeout(client.loom.ripples.prompt, 0);
}
