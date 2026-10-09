var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

if (activeClass == "Black Dragon") {
  send_command("emote dips his head in brief apology and turns away.");
} else {
  send_command("emote raises a hand in brief apology and steps away.", 1);
}