var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote folds a wing briefly around $" + targetEmote + ", steady and warm.");
} else {
  send_command("hug " + targetEmote, 1);
}