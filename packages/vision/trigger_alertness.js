// "Your enhanced senses inform you that X has entered <place>, to the <dir>."
// City members: hide the line. Enemies: colour it and alert the party.
// Uses social's lists when social is installed; otherwise lets the line be.
if (!client.loom || !client.loom.vision) run_function("vision_setup", [], "vision");
if (get_variable("vision_on") == "on") {
  var viWho = args[1];
  var viKey = viWho.toLowerCase();
  var viSoc = client.loom.social;
  var viCity = (viSoc && viSoc.lists && viSoc.lists.city) || (client.hl && client.hl.city) || null;
  var viEnem = (viSoc && viSoc.lists && viSoc.lists.enemies) || (client.hl && client.hl.enemies) || null;
  if (viCity && viCity[viKey]) {
    if (get_variable("vision_hide") == "on") gag_current_line();
  } else if (viEnem && viEnem[viKey]) {
    colorize_current_line(0, args[0].length, (viSoc && viSoc.color && viSoc.color.enemies) || "#ff5f5f", "");
    if (get_variable("vision_alert") == "on" && get_variable("pauseTriggers") != "on") {
      send_command(get_variable("vision_channel") + " ENEMY ALERT: " + viWho + " is " + args[3] + " of me, at " + args[2]);
    }
  }
}
