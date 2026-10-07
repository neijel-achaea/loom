var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote looms suddenly over $" + targetEmote + ", then rumbles loudly with delight.");
} else {
  send_command("boo " + targetEmote, 1);
}