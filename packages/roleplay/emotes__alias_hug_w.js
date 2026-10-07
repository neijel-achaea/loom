var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote folds a wing briefly around $" + targetEmote + ", steady and warm.");
} else {
  send_command("hug " + targetEmote, 1);
}