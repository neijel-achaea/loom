var emoteTarget = args[1];

var activeClass = get_variable("activeClass");

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote tips $" + emoteTarget + "'s chin up with one finger, holds $" + emoteTarget + "_his gaze for a few heartbeats, then kisses $" + emoteTarget + "_him softly.");
    break;

  case "Black Dragon":
    send_command("emote lowers his great head until his snout rests feather-light against $" + emoteTarget + ", holds $" + emoteTarget + "_his gaze for a long moment, then breathes across $" + emoteTarget + "_him something too gentle to be anything but a kiss.");

    break;
}