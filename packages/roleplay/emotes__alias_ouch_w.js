var activeClass = get_variable("activeClass");
var targetEmote = args[1];

if (activeClass == "Black Dragon") {
  send_command("emote hisses sharply and turns an injured look on $" + targetEmote);
} else {
  send_command("emote hisses through his teeth and gives $" + targetEmote + " an injured look.");
}