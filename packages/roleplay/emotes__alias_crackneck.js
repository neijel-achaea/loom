var activeClass = get_variable("activeClass");

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote tilts his head until his neck cracks, and looks pleased about it.");
    break;

  case "Black Dragon":
    send_command("emote rolls the great weight of his head until something deep in his neck gives a slow, resonant crack, and looks entirely too pleased about it.");

    break;
}