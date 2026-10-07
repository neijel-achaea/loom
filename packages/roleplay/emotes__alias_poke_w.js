var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote pokes $" + targetEmote + " with the tip of one talon.");
} else {
  send_command("emote pokes $" + targetEmote, 1);
}