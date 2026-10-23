// CIVIC [ministry or command ...]: the one command for this package.
if (!client.loom || !client.loom.civic) run_function("civic_setup", [], "civic");
var C = client.loom.civic;
var raw = String(args[1] || "").trim();
var parts = raw.split(/\s+/);
var sub = String(parts[0] || "").toLowerCase();
// Keep the original words too: titles and names keep their capitals.
C.argv = parts.slice(1);

if (sub === "" || sub === "status") run_function("civic_status", [], "civic");
else if (sub === "help") run_function("civic_help", [], "civic");
else if (sub === "aide") run_function("civic_aide", [], "civic");
else if (sub === "greet") run_function("civic_greet", [], "civic");
else if (sub === "debug") {
  // CIVIC DEBUG (#137): the city as read from GMCP and the saved settings.
  var cvCs = [];
  for (var cvK in (C.cities || {})) { if (C.cities.hasOwnProperty(cvK)) cvCs.push(cvK); }
  display_notice("[civic] city=" + (C.city || "unknown") + " known cities=" + (cvCs.join(",") || "none") + " aide=" + (get_variable("civic_aide_on") || "off")
    + " title='" + (get_variable("civic_aide_title") || "") + "' clan='" + (get_variable("civic_aide_clan") || "") + "' pause=" + (get_variable("pauseTriggers") === "on" ? "on" : "off"), "cyan");
}
else display_notice("[civic] unknown command '" + sub + "'. CIVIC HELP for commands.", "orange");
