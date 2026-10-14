var target = args[1];
var step = args[2];
var textStep = "";

switch (step) {
  case "1":
    textStep = "loosens the tie from $" + target + "'s hair and lets the loose curls fall free through his fingers, unhurried.";
    break;

  case "2":
    textStep = "picks a stray twig loose from $" + target + "'s curls, then a caught leaf, setting each aside without a word, the forest still clinging to $" + target + "_him.";
    break;

  case "3":
    textStep = "combs slow through $" + target + "'s hair with his fingers, feeling for what else the day has left tangled there, and works it gently free.";
    break;

  case "4":
    textStep = "tips the bucket and pours a slow fall of water through $" + target + "'s hair, darkening the blue of it, until every curl hangs heavy and streaming.";
    break;

  case "5":
    textStep = "works the water down through $" + target + "'s hair with both hands, root to end, until it runs clean between his fingers.";
    break;

  case "6":
    textStep = "presses small circles across $" + target + "'s scalp with his fingertips, patient, coaxing the day's tension up and out along with the water.";
    break;

  case "7":
    textStep = "cups water in both hands and pours it careful over $" + target + "'s hair a last time, rinsing the green streaks and the blue until they gleam.";
    break;

  case "8":
    textStep = "gathers the length of $" + target + "'s hair in both hands and eases the water from it with a slow, gentle press, careful of every shell and pearl.";
    break;

  case "9":
    textStep = "lifts his staff and calls a soft warmth to its head, a small caught sun, and holds it near $" + target + "'s hair until the light settles gold across the wet curls.";
    break;

  case "10":
    textStep = "passes the staff's warmth slow along the length of $" + target + "'s hair, and the water lifts from it in a faint haze, each curl drawing back into its own soft spring.";
    break;   

  case "11":
    textStep = "turns one of the bright shells twined in $" + target + "'s hair between finger and thumb, dry and warm now, and leaves it where it lies to chime.";
    break;   

  case "12":
    textStep = "draws his fingers slow through $" + target + "'s curls, following each wave where it wants to go rather than pulling it straight, the last of the damp gone from them.";
    break;   

  case "13":
    textStep = "smooths both hands down the warm, dry length of $" + target + "'s hair, settling every curl and shell back into its place with the whole warm flat of his palms.";
    break;   

  case "14":
    textStep = "lets the light of his staff fade, draws a curl of $" + target + "'s hair forward over $" + target + "_his shoulder, and kisses it gently.";
    break;   
}

if (textStep != "") {
  send_command("emote " + textStep);
  display_notice("Step " + step + " out of 14.", "cyan");
} else {
  display_notice ("Wrong step: " + args[1]);
}