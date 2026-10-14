var arg = (args[1] || "").toLowerCase();

if (arg === "on")       { set_variable("reportEnemies", 1); display_notice("[reclamation] Report Enemies mode: ON", "lime"); }
else if (arg === "off") { set_variable("reportEnemies", 0); display_notice("[reclamation] Report Enemies mode: OFF", "lime"); }
else {
  var state = get_variable("reportEnemies");
  var verboseState = (state == 1) ? "ON" : "OFF";
  display_notice("[reclamation] Report Enemies mode: " + verboseState + ". Use REPORTENEMIES ON/OFF.", "cyan");
}