var costs = get_variable("rage_costs") || {};
var cd    = get_variable("rage_cd") || {};
var rage  = get_variable("my_rage") || 0;
for (var name in costs) {
  if (rage >= costs[name]) { cd[name] = false; }
}
set_variable("rage_cd", cd);
set_variable("rage_global", true);
run_function("hl_buttons", [], "hunting");