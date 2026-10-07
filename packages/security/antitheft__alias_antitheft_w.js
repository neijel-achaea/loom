// ---- command dispatch ----
var arg = (args[1] || "").toLowerCase();

if (arg === "on")          { set_variable("antitheft", 1); display_notice("[security] Antitheft mode: ON", "cyan"); }
else if (arg === "off")    { set_variable("antitheft", 0); display_notice("[security] Antitheft mode: OFF", "cyan"); }
else {
  var state = get_variable("antitheft");
  var verboseState = (state == 1) ? "ON" : "OFF";

  display_notice("[security] Antitheft mode: " + verboseState + ". Use ANTITHEFT ON/OFF.", "cyan");
}