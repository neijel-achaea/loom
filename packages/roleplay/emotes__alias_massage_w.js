var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote runs his muzzle slowly along $" + targetEmote + "'s shoulder and up the side of $" + targetEmote + "_his neck.");
} else {
  send_command("massage " + targetEmote, 1);
}