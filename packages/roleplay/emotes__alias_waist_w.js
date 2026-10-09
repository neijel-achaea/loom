var emoteTarget = args[1];

var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote settles a hand low at $" + emoteTarget + "'s waist and draws $" + emoteTarget + "_him in until there's no space left between them.");
    break;

  case "Black Dragon":
    send_command("emote curls close about $" + emoteTarget + " until wing and coil have gathered $" + emoteTarget + "_him in against the warmth of him, with no space left anywhere between.");

    break;
}