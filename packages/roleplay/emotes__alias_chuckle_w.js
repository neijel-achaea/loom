var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote chuckles at $" + targetEmote + ", the sound turning over deep in his chest.");
} else {
  send_command("chuckle " + targetEmote, 1);
}