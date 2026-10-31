// Shopping notes the room you're in (its area is kept with each item; its
// shop shows BUY) and steps a
// lookup at each prompt.
if (!client.loom || !client.loom.shopping || !client.loom.shopping.list) run_function("shopping_setup", [], "shopping");
var SH = client.loom.shopping;
if (args.gmcp_method == "Room.Info") {
  var shG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
  var shWas = SH.shopHere();
  SH.here = { area: String(shG.area || ""), id: shG.num ? String(shG.num) : "", name: String(shG.name || "").replace(/\s*\((?:indoors|outdoors)\)\s*$/i, "") };
  // BUY shows only in the shop you're in: redraw when that changes.
  if (SH.shopHere() !== shWas) run_function("shopping_render", [], "shopping");
} else if (SH.q && args.gmcp_method == "Char.Vitals") {
  // After the packet's own lines, so the table is read first.
  setTimeout(SH.prompt, 0);
}
