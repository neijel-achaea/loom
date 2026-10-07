var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote nudges $" + targetEmote + " with a wing, suggestively.");
} else {
  send_command("nudge " + targetEmote, 1);
}