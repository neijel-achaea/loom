// ---- command dispatch ----
var arg = args[1] || "";

if (arg === "on")          { set_variable("autogold", "on"); display_notice("[hunting] Autogold mode: ON", "cyan"); }
else if (arg === "off")    { set_variable("autogold", "off"); display_notice("[hunting] Autogold mode: OFF", "cyan");}
else if (arg === "all")    { set_variable("autogold", "all"); display_notice("[hunting] Autogold mode: ALL", "cyan"); }
else {
  var state = get_variable("autogold");
  display_notice("[hunting] Autogold mode: " + state + ". Use AUTOGOLD ON/OFF/ALL.", "cyan");
}