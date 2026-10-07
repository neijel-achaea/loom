var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote lowers his head and presses his brow to $" + targetEmote + "'s, breath warm between them.");
} else {
  send_command("kiss " + targetEmote, 1);
}