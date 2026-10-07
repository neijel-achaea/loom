var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote touches his muzzle briefly to $" + targetEmote + "'s cheek.");
} else {
  send_command("peck " + targetEmote, 1);
}