var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote (Pressing his lips together tightly,) holds for one heroic second, and then loses it at once in a snort he can do nothing about");
    break;

  case "Black Dragon":
    send_command("emote (Holding his head rigidly still,) manages one heroic second, and then loses it all at once in a sizzling snort of smoke he can do nothing about.");

    break;
}