var target = args[1];
var step = args[2];
var textStep = "";

switch (step) {
  case "1":
    textStep = "draws $" + target + "'s foot up into his lap and cradles it in both hands, in no hurry, letting the warmth of his palms settle in first.";
    break;

  case "2":
    textStep = "presses both thumbs slow along the arch of $" + target + "'s foot, from heel toward toe, sinking them gently in the skin.";
    break;

  case "3":
    textStep = "works a firm, patient circle into the heel of $" + target + "'s foot, where the whole day's walking has come to rest.";
    break;

  case "4":
    textStep = "leans an even weight up the sole of $" + target + "'s foot, one small press after another, coaxing the tightness loose.";
    break;

  case "5":
    textStep = "rolls his thumbs across the ball of $" + target + "'s foot, just beneath the toes, easing out the ache of standing.";
    break;

  case "6":
    textStep = "draws each of $" + target + "'s toes gently through his fingers in turn, unhurried, wringing the last of the tension out.";
    break;

  case "7":
    textStep = "circles $" + target + "'s ankle slowly in one hand, loosening the joint, while the other steadies the foot.";
    break;

  case "8":
    textStep = "smooths both thumbs up the top of $" + target + "'s foot in long strokes, following the line of each tendon out to the toes.";
    break;

  case "9":
    textStep = "presses the whole warm flat of both hands around $" + target + "'s foot and simply holds it there, letting it rest heavy and easy.";
    break;

  case "10":
    textStep = "sets $" + target + "'s foot down softly and smiles at $" + target + "_him.";
    break;   
}

if (textStep != "") {
  send_command("emote " + textStep);
  display_notice("Step " + step + " out of 10.", "cyan");
} else {
  display_notice ("Wrong step: " + args[1]);
}