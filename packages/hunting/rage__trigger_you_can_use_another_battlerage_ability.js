var costs = get_variable("rage_costs") || {};
var cd    = get_variable("rage_cd") || {};
var rage  = get_variable("my_rage") || 0;
var avail = {};
var list  = args[1].replace(/\.\s*$/, "").split(/,\s*/);
for (var i = 0; i < list.length; i++) { avail[list[i]] = true; }
for (var name in costs) {
  if (avail[name]) {
    cd[name] = true;
  } else if (rage >= costs[name]) {
    cd[name] = false;
  }
}
set_variable("rage_cd", cd);
set_variable("rage_global", true);
run_function("hl_buttons", [], "hunting");