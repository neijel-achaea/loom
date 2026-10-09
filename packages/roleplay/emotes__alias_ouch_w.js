var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote hisses sharply and turns an injured look on $" + targetEmote);
} else {
  send_command("emote hisses through his teeth and gives $" + targetEmote + " an injured look.");
}