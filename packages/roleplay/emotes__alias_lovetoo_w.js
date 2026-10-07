var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lowers his head to $" + targetEmote + " and murmurs, \"I love you too.\"");
} else {
  send_command("lovetoo " + targetEmote, 1);
}