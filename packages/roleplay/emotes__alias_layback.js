var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote lies back, unbothered, and makes himself comfortable");
    break;

  case "Black Dragon":
    send_command("emote settles back with an unbothered sprawl, folds his wings loose, and arranges the great weight of himself into perfect comfort.");

    break;
}