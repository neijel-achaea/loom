var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote traces his muzzle up the line of $" + targetEmote + "'s neck and rests it at the base of $" + targetEmote + "_his jaw.");
} else {
  send_command("neckkiss " + targetEmote, 1);
}