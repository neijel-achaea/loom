var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote lifts one shoulder in a gesture that suggests the matter has already outlived his interest");
    break;

  case "Black Dragon":
    send_command("emote shifts one great wing a fraction, a gesture that suggests the matter has already outlived his interest.");

    break;
}