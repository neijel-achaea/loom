var activeClass = get_variable("activeClass");

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote lifts one shoulder in a gesture that suggests the matter has already outlived his interest");
    break;

  case "Black Dragon":
    send_command("emote shifts one great wing a fraction, a gesture that suggests the matter has already outlived his interest.");

    break;
}