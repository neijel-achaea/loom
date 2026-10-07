var emoteTarget = args[1];

var activeClass = get_variable("activeClass");

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote (Tilting his head, one hand cupped to his ear,) looks at $" + emoteTarget + " and gestures at the wind with mild reproach.");
    break;

  case "Black Dragon":
    send_command("emote (Cocking his great head, straining to catch a word over the gale,) fixes $" + emoteTarget + " with a look and huffs a short breath at the wind in mild reproach.");

    break;
}