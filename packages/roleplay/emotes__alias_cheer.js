var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote throws his head back and roars in triumph, wings flung wide.");
} else {
  send_command("emote cheers, all his composure abandoned.");
}