var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote hisses sharply, pained, a curl of vapour escaping with it.");
} else {
  send_command("emote hisses through his teeth, pained.", 1);
}