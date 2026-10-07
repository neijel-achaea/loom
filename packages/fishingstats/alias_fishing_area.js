run_function("fsh_ensure", [], "fishingstats");
var v = args[1] || "";
if (!v) {
  display_notice("[fishing] area now: " + (client.fshAreaNow || "unknown") + " (from " + (client.fshAreaSrc || "nothing found") + ")", "cyan");
  display_notice("[fishing] fparea <name> to override, fparea auto to go back to detection, fparea reset to forget areas seen this session.", "white");
} else if (v === "auto" || v === "reset") {
  if (v === "auto") {
    client.fshAreaManual = "";
    try { set_variable("fsh_area", ""); } catch (e) {}
  }
  // Areas accumulate across a session, so a stale manual entry has to be
  // cleared out too, then reseeded from whatever detection now reports.
  client.fsh.areas = {};
  run_function("fsh_ensure", [], "fishingstats");
  if (client.fshAreaNow) { client.fsh.areas[client.fshAreaNow] = 1; }
  try { set_variable("fsh_session", JSON.stringify(client.fsh)); } catch (e) {}
  run_function("fsh_render", [], "fishingstats");
  display_notice("[fishingstats] area is now " + (client.fshAreaNow || "unknown") + " (from " + (client.fshAreaSrc || "nothing found") + "). Earlier areas this session were forgotten.", "cyan");
} else {
  client.fshAreaManual = v;
  try { set_variable("fsh_area", v); } catch (e) {}
  client.fsh.areas[v] = (client.fsh.areas[v] || 0) + 1;
  try { set_variable("fsh_session", JSON.stringify(client.fsh)); } catch (e) {}
  run_function("fsh_render", [], "fishingstats");
  display_notice("[fishingstats] area pinned to " + v + ". This overrides detection until fparea auto.", "cyan");
}