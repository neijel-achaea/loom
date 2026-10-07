var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lowers his head to $" + targetEmote + ", plainly grateful.");
} else {
  send_command("emote inclines his head to $" + targetEmote + ", plainly grateful.");
}