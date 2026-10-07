var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote bows low before $" + targetEmote + ", wings folded and head held down a moment.");
} else {
  send_command("bow " + targetEmote, 1);
}