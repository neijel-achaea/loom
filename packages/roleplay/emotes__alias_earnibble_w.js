var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote brings his jaws close and breathes warm against $" + targetEmote + "'s ear");
} else {
  send_command("earnibble " + targetEmote, 1);
}