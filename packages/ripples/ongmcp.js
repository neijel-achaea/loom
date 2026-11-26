// onGMCP: only the prompt matters (Char.Vitals), after the packet's own lines.
if (args.gmcp_method == "Char.Vitals") {
  if (!client.loom || !client.loom.ripples || !client.loom.ripples.prompt) run_function("ripples_setup", [], "ripples");
  setTimeout(client.loom.ripples.prompt, 0);
}
