var emoteTarget = args[1];

var activeClass = get_variable("activeClass");

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote lifts a loose strand of $" + emoteTarget + "'s hair and tucks it behind $" + emoteTarget + "_his ear.");
    break;

  case "Black Dragon":
    send_command("emote lowers his great head close to $" + emoteTarget + " and, with great care, breathes a slow warmth along the line of $" + emoteTarget + "_his hair, and it stirs at the touch of it.");

    break;
}