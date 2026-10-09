var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote makes a delighted sound and lets his wings spread with it.");
} else {
  send_command("emote brightens considerably, delighted.");
}