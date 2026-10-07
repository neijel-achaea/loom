run_function("fsh_ensure", [], "fishingstats");
display_notice("[fishingstats] detected area: " + (client.fshAreaNow || "nothing found"), "cyan");
display_notice("[fishingstats] source: " + (client.fshAreaSrc || "no candidate variable held a value"), "cyan");
var probes = ["currentArea", "room_area", "my_area", "area", "roomarea", "room_zone"];
for (var i = 0; i < probes.length; i++) {
  var v = "(unset)";
  try { if (get_variable(probes[i]) !== undefined) { v = String(get_variable(probes[i])); } } catch (e) { v = "(error)"; }
  display_notice("  " + probes[i] + " = " + v, "cyan");
}