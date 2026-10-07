var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote laughs with $" + targetEmote + ", the sound rolling out of him.");
} else {
  send_command("laugh " + targetEmote, 1);
}