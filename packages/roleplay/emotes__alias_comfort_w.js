var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote folds a wing over $" + targetEmote + " and keeps it there.");
} else {
  send_command("emote settles an arm around $" + targetEmote + "'s shoulders and stays there.");
}