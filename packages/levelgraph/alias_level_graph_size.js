run_function("lvl_ensure", [], "levelgraph");
var v = args[1] ? parseInt(args[1], 10) : 0;
if (!v) { display_notice("[level] panel graph height is " + client.lvlChartH + ". Usage: lvlgraphsize 40-400 (default 105), applies to both panes.", "cyan"); }
else if (v < 40 || v > 400) { display_notice("[level] pick a height between 40 and 400.", "yellow"); }
else {
  client.lvlChartH = v;
  try { set_variable("lvl_graph_h", String(v)); } catch (e) {}
  run_function("lvl_render", [], "levelgraph");
  display_notice("[level] panel graph height set to " + v + ".", "cyan");
}