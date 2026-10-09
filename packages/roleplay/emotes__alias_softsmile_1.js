var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote lets a slow smile settle across his face");
    break;

  case "Black Dragon":
    send_command("emote lets a slow warmth settle into his eyes.");

    break;
}