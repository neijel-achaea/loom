// alias: ragedebug
var slots = get_variable("rage_slots");
var costs = get_variable("rage_costs");
var cd    = get_variable("rage_cd");

display_notice("rage: "   + get_variable("my_rage"), "orange");
display_notice("global: " + get_variable("rage_global"), "orange");
display_notice("slots: "  + JSON.stringify(slots), "orange");
display_notice("costs: "  + JSON.stringify(costs), "orange");
display_notice("cd: "     + JSON.stringify(cd), "orange");