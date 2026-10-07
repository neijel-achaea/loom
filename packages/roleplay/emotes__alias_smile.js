var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote softens, in what is unmistakably a smile.");
} else {
  send_command("smile", 1);
}