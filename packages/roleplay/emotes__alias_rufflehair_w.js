var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote drags a talon lightly through $" + targetEmote + "'s hair, leaving it worse than he found it.");
} else {
  send_command("rufflehair " + targetEmote, 1);
}