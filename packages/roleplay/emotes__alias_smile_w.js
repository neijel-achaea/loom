var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote softens at $" + targetEmote + ", unmistakably pleased.");
} else {
  send_command("smile " + targetEmote, 1);
}