var S = client.loom.sigils;
var which = S.argv[0] || "";
var v = parseInt(S.argv[1], 10);
if ((which === "monolith" || which === "flame") && !isNaN(v) && v >= 0) {
  set_variable("sigils_cost_" + which, v);
} else if (which !== "") {
  display_notice("[sigils] use SIGILS COST MONOLITH <gold> or SIGILS COST FLAME <gold>.", "orange");
}
display_notice("[sigils] costs: monolith sigil " + get_variable("sigils_cost_monolith")
  + " gold, flame sigil " + get_variable("sigils_cost_flame") + " gold.", "cyan");
