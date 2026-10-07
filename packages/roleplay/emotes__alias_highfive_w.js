var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lifts a foreclaw and lets $" + targetEmote + " strike $" + targetEmote + "_his palm against it.");
} else {
  send_command("emote swings his arm up and claps his palm to $" + targetEmote + "'s, grinning.");
}