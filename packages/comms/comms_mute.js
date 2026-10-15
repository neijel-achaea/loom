// comms_mute -- args {key, on}: mute or unmute a channel. A muted channel is
// still kept (its own filter shows it) but is left out of All and counts no
// unread. Saved in comms_muted.
var C = client.loom.comms;
var muK = String(args.key || "");
if (args.on) { C.muted[muK] = true; if (C.chans[muK]) C.chans[muK].unread = 0; if (muK === "tells") { for (var muV in C.convs) { if (C.convs.hasOwnProperty(muV)) C.convs[muV].unread = 0; } } }
else delete C.muted[muK];
set_variable("comms_muted", Object.keys(C.muted).join(","));
display_notice("[comms] " + C.name(muK) + (args.on ? " muted: kept, but left out of All." : " unmuted."), "lime");
run_function("comms_render", [], "comms");
