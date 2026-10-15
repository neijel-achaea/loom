// comms_view -- args {key}: what the Comms tab shows. "all", "tells" (the
// conversations), "tell:<name>" (one conversation) or a channel key. What
// comes into view counts as read; the tab jumps to the newest line.
var C = client.loom.comms;
var vwK = String(args.key || "all");
var vwOk = vwK === "all" || vwK === "tells" || (vwK.indexOf("tell:") === 0 && C.convs[vwK.slice(5)]) || (vwK !== "tells" && C.chans[vwK]);
if (vwOk) {
  C.view = vwK;
  if (vwK === "all") {
    for (var vwC in C.chans) { if (C.chans.hasOwnProperty(vwC) && !C.muted[vwC]) C.chans[vwC].unread = 0; }
    if (!C.muted.tells) { for (var vwV in C.convs) { if (C.convs.hasOwnProperty(vwV)) C.convs[vwV].unread = 0; } }
  } else if (vwK.indexOf("tell:") === 0) {
    C.convs[vwK.slice(5)].unread = 0;
  } else if (vwK !== "tells") {
    C.chans[vwK].unread = 0;
  }
  C.jump = true;
}
run_function("comms_render", [], "comms");
