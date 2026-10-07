var activeClass = get_variable("activeClass");

if (activeClass == "Black Dragon") {
  send_command("emote dips his head in greeting.");
} else {
  send_command("emote raises a hand in greeting.", 1);
}