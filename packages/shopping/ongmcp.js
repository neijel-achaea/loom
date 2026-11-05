// Shopping notes the room you're in (its area is kept with each item; its
// shop shows BUY) and steps a lookup or a rift reading at each prompt.
if (!client.loom || !client.loom.shopping || !client.loom.shopping.list) run_function("shopping_setup", [], "shopping");
var SH = client.loom.shopping;
if (args.gmcp_method == "Room.Info") {
  var shG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
  var shWas = SH.shopHere();
  SH.here = { area: String(shG.area || ""), id: shG.num ? String(shG.num) : "", name: String(shG.name || "").replace(/\s*\((?:indoors|outdoors)\)\s*$/i, "") };
  // BUY shows only in the shop you're in: redraw when that changes.
  if (SH.shopHere() !== shWas) run_function("shopping_render", [], "shopping");
  // First room of the session: with minimums of your own, read the rift
  // once (hidden), so the Restock reminder starts from today's stock (#440).
  if (!SH.started) {
    SH.started = true;
    for (var shMi in SH.mins) if (SH.mins.hasOwnProperty(shMi)) { if (!SH.paused()) SH.readRift(""); break; }
  }
} else if (SH.w && args.gmcp_method == "Char.Vitals") {
  setTimeout(function () { if (SH.w) SH.waresDone(); }, 0);
}
if ((SH.q || SH.r) && args.gmcp_method == "Char.Vitals") {
  // After the packet's own lines, so the table is read first.
  setTimeout(function () { SH.riftPrompt(); SH.prompt(); }, 0);
}
