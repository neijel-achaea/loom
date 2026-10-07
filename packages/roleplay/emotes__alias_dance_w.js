var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote coils about $" + targetEmote + " in a slow turn, graceful past all reason for his bulk.");
} else {
  send_command("dance " + targetEmote, 1);
}