// "Your enhanced senses inform you that X has entered <place>, to the <dir>."
// City members: hide the line. Enemies: colour it and alert the party.
// Uses social's lists when social is installed; otherwise lets the line be.
if (!client.loom || !client.loom.vision) run_function("vision_setup", [], "vision");
if (get_variable("vision_on") == "on") {
  var viWho = args[1];
  var viKey = viWho.toLowerCase();
  var viLook = client.loom.social && client.loom.social.look;
  var viIn = function (g) { return !!(viLook && viLook.inGroup && viLook.inGroup(viKey, g)); };
  // What this line did, for VISION DEBUG.
  client.loom.vision.last = { who: viWho, did: "let through (not in city or enemies)", at: Date.now() };
  if (viIn("city")) {
    if (get_variable("vision_hide") == "on") gag_current_line();
    client.loom.vision.last.did = get_variable("vision_hide") == "on" ? "hidden (city)" : "let through (city, hide off)";
  } else if (viIn("enemies")) {
    client.loom.vision.last.did = "coloured (enemy)";
    var viCol = "#ff5f5f", viGs = (viLook && viLook.groups) ? viLook.groups(viKey) : [];
    for (var viG = 0; viG < viGs.length; viG++) { if (viGs[viG].group === "enemies" && viGs[viG].colour) viCol = viGs[viG].colour; }
    colorize_current_line(0, args[0].length, viCol, "");
    if (get_variable("vision_alert") == "on" && get_variable("pauseTriggers") != "on") {
      send_command(get_variable("vision_channel") + " ENEMY ALERT: " + viWho + " is " + args[3] + " of me, at " + args[2]);
      client.loom.vision.last.did = "coloured and alerted on " + get_variable("vision_channel");
    }
  }
}
