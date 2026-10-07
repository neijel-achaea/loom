var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote turns his head and fixes $" + targetEmote + " with an unblinking stare.");
} else {
  send_command("emote fixes $" + targetEmote + " with a long, level stare.");
}