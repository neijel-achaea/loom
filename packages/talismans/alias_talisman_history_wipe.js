run_function("tal_ensure", [], "talismans");
var arg = args[1] || "";
if (arg === "confirm") {
  client.talHist = [];
  try { set_variable("tal_hist", "[]"); } catch (e) {}
  run_function("tal_render", [], "talismans");
  display_notice("[talismans] progress history cleared. Piece counts are untouched.", "red");
} else {
  display_notice("[talismans] this clears the progress GRAPH history only, not your pieces. Type 'talhistwipe confirm' to proceed.", "yellow");
}