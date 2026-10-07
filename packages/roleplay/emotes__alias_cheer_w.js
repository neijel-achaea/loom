var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote roars his delight for $" + targetEmote + ", wings flung wide.");
} else {
  send_command("emote cheers $" + targetEmote + " on, composure entirely forgotten.");
}