var target = args[1];
var step = args[2];
var textStep = "";

switch (step) {
  case "1":
    textStep = "Without breaking off mid-sentence, " + target + " dips the end of her quarterstaff into an enormous mug of kawhe and gives it two brisk stirs.";
    break;

  case "2":
    textStep = target + " regards the enormous mug of kawhe for a long moment, then tips it back and drains the whole of it without pausing once for breath.";
    break;

  case "3":
    textStep = "A rich brown light suddenly wells up from within " + target + ", and the air about her turns thick with the scent of roasting beans.";
    break;

  case "4":
    textStep = "The kawhe-dark glow deepens to a scalding intensity as " + target + "'s body swells and remakes itself into that of a powerful and massive Dragon.";
    break;

  case "5":
    textStep = "Reveling in her power, " + target + " beats her mighty wings, throws her horned head back, and roars a challenge that rolls out over the world like steam from a spilt pot.";
    break;

  case "6":
    textStep = "The saucer-sized eyes of " + target + " close briefly in ominous concentration, and twin curls of fragrant vapour drift up from her nostrils.";
    break;

  case "7":
    textStep = "With a low percolating rumble from deep within her belly, " + target + " utters a guttural chant. Her skin ripples as a froth of golden cream races like fire across its surface, settling to solidify into a flexible, faintly steaming shell.";
    break;

  case "8":
    textStep = target + " begins to flap her wings powerfully, and rises quickly up into the firmament.";
    break;

  case "9":
    textStep = "LETHAL A massive shadow begins to circle in the skies above, trailing a plume of steam and the unmistakable smell of a fresh pot.";
    break;

  case "10":
    textStep = "High above, " + target + " opens her glistening, tooth-lined maw wide and pours a great tempest of scalding kawhe down upon you, served black, unsweetened, and with no escape or reprieve.";
    break;

  case "11":
    textStep = target + " touches down amid the wreckage, folds her wings, and licks a stray drop of kawhe from her muzzle with evident satisfaction.";
    break;
}

if (textStep != "") {
  send_command("cast illusion " + textStep);
  display_notice("Step " + step + " out of 11.", "cyan");
} else {
  display_notice ("Wrong step: " + args[1]);
}