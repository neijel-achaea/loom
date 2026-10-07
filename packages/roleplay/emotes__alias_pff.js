var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote huffs, short and dismissive.");
} else {
  send_command("emote makes a short, dismissive sound.", 1);
}