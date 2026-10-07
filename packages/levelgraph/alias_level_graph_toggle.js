run_function("lvl_ensure", [], "levelgraph");
var which = args[1] || "both";
var mode = args[2] || "";
if (which === "session" || which === "both") {
  if (mode === "on") { client.lvlGraphSess = true; }
  else if (mode === "off") { client.lvlGraphSess = false; }
  else { client.lvlGraphSess = !client.lvlGraphSess; }
  try { set_variable("lvl_graph_sess", client.lvlGraphSess ? "1" : "0"); } catch (e) {}
}
if (which === "long" || which === "both") {
  if (mode === "on") { client.lvlGraphLong = true; }
  else if (mode === "off") { client.lvlGraphLong = false; }
  else { client.lvlGraphLong = !client.lvlGraphLong; }
  try { set_variable("lvl_graph_long", client.lvlGraphLong ? "1" : "0"); } catch (e) {}
}
run_function("lvl_render", [], "levelgraph");
display_notice("[level] session graph " + (client.lvlGraphSess ? "shown" : "hidden") + ", long-term graph " + (client.lvlGraphLong ? "shown" : "hidden") + ".", "cyan");