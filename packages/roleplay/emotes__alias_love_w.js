var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lowers his head to $" + targetEmote + " and murmurs, \"I love you.\"");
} else {
  send_command("love " + targetEmote, 1);
}