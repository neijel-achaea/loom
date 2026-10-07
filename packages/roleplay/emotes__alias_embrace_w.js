var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (targetEmote == "death") { 
  send_command("embrace death");
}
else if (targetEmote == "flame") { 
  send_command("embrace flame");
}
else {
  if (activeClass == "Black Dragon") {
    send_command("emote draws $" + targetEmote + " against him and closes both wings around $" + targetEmote + "_him.");
  } else {
    send_command("embrace " + targetEmote, 1);
  }
}