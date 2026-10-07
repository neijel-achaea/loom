var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lowers his great head toward $" + targetEmote + " and rumbles, low and warm.");
} else {
  send_command("aww " + targetEmote, 1);
}