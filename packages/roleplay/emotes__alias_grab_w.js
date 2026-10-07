var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote hooks a foreclaw about $" + targetEmote + " and pulls $" + targetEmote + "_him from harm's way.");
} else {
  send_command("grab " + targetEmote, 1);
}