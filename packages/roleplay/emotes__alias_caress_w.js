var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote draws the back of one talon along $" + targetEmote + "'s cheek, careful as anything.");
} else {
  send_command("emote brushes his fingers along $" + targetEmote + "'s cheek, unhurried.");
}