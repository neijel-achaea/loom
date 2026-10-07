var activeClass = get_variable("activeClass");

switch (activeClass) {
  case "Druid":
  case "Magi":
    send_command("emote turns his gaze upward for a long, wordless moment, then lets it fall back with a sigh");
    break;

  case "Black Dragon":
    send_command("emote lifts his gaze skyward, holds it a long, wordless while, then lets it fall on a breath that drifts out warm and acrid, like a sigh with smoke in it.");

    break;
}