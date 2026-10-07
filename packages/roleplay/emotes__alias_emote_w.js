var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote x");
} else {
  send_command("y " + targetEmote, 1);
}