// "<name> tells you, \"Gate.\"": open a sonic portal for city members (from
// social's city list, when social is installed).
if (!client.loom || !client.loom.crystalism || !client.loom.crystalism.shapes) run_function("crystalism_setup", [], "crystalism");
var CR = client.loom.crystalism;
if (get_variable("crystalism_portal") == "on") {
  var crWho = args[1];
  var crLook = client.loom.social && client.loom.social.look;
  if (!crLook || !crLook.inGroup) {
    display_notice("[crystalism] " + crWho + " asked for a portal, but no city list is available (social isn't installed).", "orange");
  } else if (get_variable("pauseTriggers") == "on") {
    display_notice("[crystalism] " + crWho + " asked for a portal; not sent while triggers are paused.", "orange");
  } else if (!crLook.inGroup(crWho, "city")) {
    send_command("tell " + crWho + " Sorry, you're not in my allowed list.");
  } else {
    send_command("embed sonicportal " + crWho);
    display_notice("[crystalism] portal opened for " + crWho + ".", "lime");
  }
}
