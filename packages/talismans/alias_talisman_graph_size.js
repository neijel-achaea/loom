run_function("tal_ensure", [], "talismans");
var v = args[1] ? parseInt(args[1], 10) : 0;
if (!v) { display_notice("[talismans] panel graph height is " + client.talChartH + "px of viewBox. Usage: talgraphsize 40-400 (default 110, lower is flatter).", "cyan"); }
else if (v < 40 || v > 400) { display_notice("[talismans] pick a height between 40 and 400.", "yellow"); }
else {
  client.talChartH = v;
  try { set_variable("tal_graph_h", String(v)); } catch (e) {}
  run_function("tal_render", [], "talismans");
  display_notice("[talismans] panel graph height set to " + v + ".", "cyan");
}