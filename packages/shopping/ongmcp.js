// Shopping notes the area you're in (kept with each item) and steps a
// lookup at each prompt.
if (!client.loom || !client.loom.shopping || !client.loom.shopping.list) run_function("shopping_setup", [], "shopping");
var SH = client.loom.shopping;
if (args.gmcp_method == "Room.Info") {
  var shG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
  SH.here = { area: String(shG.area || "") };
} else if (SH.q && args.gmcp_method == "Char.Vitals") {
  // After the packet's own lines, so the table is read first.
  setTimeout(SH.prompt, 0);
}
