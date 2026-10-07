var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote bumps his head against $" + targetEmote + ", companionable.");
} else {
  send_command("emote pulls $" + targetEmote + " into a brief, friendly cuddle.");
}