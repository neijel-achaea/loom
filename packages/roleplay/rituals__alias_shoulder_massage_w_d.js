var target = args[1];
var step = args[2];
var textStep = "";

switch (step) {
  case "1":
    textStep = "steps in behind $" + target + " and rests both hands on $" + target + "_his shoulders, warm and unhurried, in no rush to begin.";
    break;

  case "2":
    textStep = "gathers $" + target + "'s hair aside with a gentle sweep, baring the nape, and lets his palms settle where neck meets shoulder.";
    break;

  case "3":
    textStep = "leans a slow, even weight through both thumbs at the base of $" + target + "'s neck, and holds until the muscle yields.";
    break;

  case "4":
    textStep = "moves in long, broad passes across $" + target + "'s shoulders, warming the muscle the way sun warms cold ground.";
    break;

  case "5":
    textStep = "finds the knot riding high in $" + target + "'s shoulder and works a slow circle into it, firm and patient, giving it nowhere to hide.";
    break;

  case "6":
    textStep = "gathers the muscle of $" + target + "'s shoulder between fingers and heel of hand and kneads it loose, unhurried as kneading dough.";
    break;

  case "7":
    textStep = "walks his thumbs up either side of $" + target + "'s neck, one small press at a time, easing each turn as he climbs.";
    break;

  case "8":
    textStep = "cradles the back of $" + target + "'s skull in one hand and circles his thumb into the hollow at the nape, where the day tends to gather.";
    break;

  case "9":
    textStep = "turns his attention to the one shoulder, both hands, and coaxes the held tension out of it before moving to its twin.";
    break;

  case "10":
    textStep = "draws both hands in one long sweep from the base of $" + target + "'s neck out to the point of each shoulder, smoothing everything in their wake.";
    break;   

  case "11":
    textStep = "lets the pressure ebb, fingertips drifting lighter and lighter across $" + target + "'s shoulders until they are barely there at all.";
    break;

  case "12":
    textStep = "stills at last, both palms resting flat and warm on $" + target + "'s shoulders, and simply holds them there a while.";
    break;

  case "13":
    textStep = "presses a last slow press to the top of $" + target + "'s spine, then murmurs low, \"There. Let the rest of it go.\"";
    break;
}

if (textStep != "") {
  send_command("emote " + textStep);
  display_notice("Step " + step + " out of 13.", "cyan");
} else {
  display_notice ("Wrong step: " + args[1]);
}