var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote points a talon at $" + targetEmote);
} else {
  send_command("emote points a finger at $" + targetEmote);
}