var activeClass = get_variable("activeClass");

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote lets a slow smile settle across his face");
    break;

  case "Black Dragon":
    send_command("emote lets a slow warmth settle into his eyes.");

    break;
}