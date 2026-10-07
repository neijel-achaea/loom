var emoteTarget = args[1];

var activeClass = get_variable("activeClass");

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote (Saying nothing at all,) draws $" + emoteTarget + " into the curve of his arm and keeps $" + emoteTarget + "_him there.");
    break;

  case "Black Dragon":
    send_command("emote (Saying nothing at all,) curls his neck and one great wing around $" + emoteTarget + " and draws $" + emoteTarget + "_him into the sheltered warmth against his flank.");    
    break;
}