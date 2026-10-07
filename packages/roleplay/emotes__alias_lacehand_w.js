var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lets the end of his tail find $" + targetEmote + "'s and settles there.");
} else {
  send_command("lacehand " + targetEmote, 1);
}