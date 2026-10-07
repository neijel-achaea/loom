var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote crosses to $" + targetEmote + " in two great strides and folds a wing around $" + targetEmote + "_him.");
} else {
  send_command("bearhug " + targetEmote, 1);
}