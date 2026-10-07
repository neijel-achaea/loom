run_function("lvl_ensure", [], "levelgraph");
var arg = args[1] || "";
if (arg === "confirm") {
  client.lvlMin = [];
  client.lvlDay = [];
  try { set_variable("lvl_min", "[]"); set_variable("lvl_day", "[]"); set_variable("lvl_hist", "[]"); } catch (e) {}
  run_function("lvl_render", [], "levelgraph");
  display_notice("[level] both level buffers cleared, legacy history too.", "red");
} else {
  display_notice("[level] this clears BOTH the session and long-term buffers. Type 'lvlhistwipe confirm' to proceed.", "yellow");
}