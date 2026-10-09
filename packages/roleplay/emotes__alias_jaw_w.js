var emoteTarget = args[1];

var activeClass = (client.loom && client.loom.roleplay && client.loom.roleplay.cls) || get_variable("roleplay_class") || "";

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote tips $" + emoteTarget + "'s chin up with one finger, holds $" + emoteTarget + "_his gaze for a few heartbeats, then kisses $" + emoteTarget + "_him softly.");
    break;

  case "Black Dragon":
    send_command("emote lowers his great head until his snout rests feather-light against $" + emoteTarget + ", holds $" + emoteTarget + "_his gaze for a long moment, then breathes across $" + emoteTarget + "_him something too gentle to be anything but a kiss.");

    break;
}