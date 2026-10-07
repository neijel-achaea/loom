var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote huffs at $" + targetEmote + ", unimpressed.");
} else {
  send_command("emote makes a short, dismissive sound at $" + targetEmote);
}