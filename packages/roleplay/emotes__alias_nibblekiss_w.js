var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote bumps his muzzle lightly against $" + targetEmote + ", then lowers his head and presses his brow to $"+ targetEmote + "_hiss.");
} else {
  send_command("nibblekiss " + targetEmote, 1);
}