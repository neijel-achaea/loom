var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote raises a foreclaw to catch $" + targetEmote + "'s attention.");
} else {
  send_command("raisehand " + targetEmote, 1);
}