// "You remove X." -- put X back on if antitheft is on and X is watched.
if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
if (get_variable("security_antitheft") == "on" && get_variable("pauseTriggers") != "on") {
  var seDesc = args[1];
  var seWear = "";
  if (SE.backpack && seDesc == get_variable("security_backpack_desc")) seWear = "wear " + SE.backpack;
  for (var seI = 0; seI < SE.items.length; seI++) {
    if (SE.items[seI].desc == seDesc) seWear = SE.items[seI].wear;
  }
  if (seWear) {
    send_command(seWear);
    display_notice("[security] WARNING: potential theft (" + seDesc + ").", "red");
  }
}
