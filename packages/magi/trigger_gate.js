// "<name> tells you, \"Gate.\"": open a sonic portal for city members (from
// social's city list, when social is installed). Left to crystalism while
// it's still installed, so the portal isn't opened twice.
if (!client.loom || !client.loom.magi || !client.loom.magi.shapes) run_function("magi_setup", [], "magi");
var MG = client.loom.magi;
if (get_variable("magi_portal") == "on" && !MG.oldInstalled().length) {
  var mgWho = args[1];
  var mgLook = client.loom.social && client.loom.social.look;
  if (!mgLook || !mgLook.inGroup) {
    display_notice("[magi] " + mgWho + " asked for a portal, but no city list is available (social isn't installed).", "orange");
  } else if (get_variable("pauseTriggers") == "on") {
    display_notice("[magi] " + mgWho + " asked for a portal; not sent while triggers are paused.", "orange");
  } else if (!mgLook.inGroup(mgWho, "city")) {
    send_command("tell " + mgWho + " Sorry, you're not in my allowed list.");
  } else {
    send_command("embed sonicportal " + mgWho);
    display_notice("[magi] portal opened for " + mgWho + ".", "lime");
  }
}
