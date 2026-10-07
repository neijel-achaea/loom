var target = args[1];
var step = args[2];
var textStep = "";

switch (step) {
  case "1":
    textStep = "emote steps onto the stone floor, waiting amongst the roots until the murmuring of the gathered falls still.";
    break;

  case "2":
    textStep = "cast illusion The drifting wisps slow in their wandering and gather overhead, their green light pooling softly upon the floor.";
    break;

  case "3":
    textStep = "say Welcome, everyone. We gather here beneath the roots of Eleusis, amongst those who rest within these walls, to mark the moment a seed breaks the soil and turns towards the light.";
    display_notice("[eleusis] Skip to step 6 if Lady Gaia is not present.", "cyan");
    break;

  case "4":
    textStep = "emote turns towards Lady Gaia and bows deeply, holding the bow for a long breath before rising.";
    break;

  case "5":
    textStep = "say Earthmother, we are honoured beyond words by Your presence. With Your leave, we begin.";
    break;

  case "6":
    textStep = "emote extends an open hand towards $" + target + ", inviting $" + target + "_him to stand in the center of the room.";
    break;

  case "7":
    textStep = "say Gather around " + target + ", please.";
    break;

  case "8":
    textStep = "say " + target + " came to us as a Uaithne, and has walked the paths of the Saiha since.";
    break;

  case "9":
    textStep = "cast illusion A single wisp drifts down from amongst the roots and hovers at the heart of the gathering, casting a pale green light over all.";
    break;

  case "10":
    textStep = "say " + target + ", each of us is bound to some corner of Nature's vast body. Tell us, which environment calls to you?";
    display_notice("[eleusis] Use feel_environment optional after the reply.", "cyan");

    break;   

  case "11":
    textStep = "say Then let it know you as its own, and may you never walk there as a stranger.";
    break;

  case "12":
    textStep = "say Before we proceed, the floor belongs to those who have walked beside " + target + ". Is there any here who would offer words?";
    break;

  case "13":
    textStep = "emote lets his gaze travel slowly across every face in the gathering.";
    break;

  case "14":
    textStep = "say It is our custom that none join us unwelcomed. If any here holds a true objection to the graduation of " + target + ", let them speak it now, openly and before all.";
    break;
    
  case "15":
    textStep = "say " + target + ", you will now speak the Oath. Repeat after me, and let each word be your own.";
    display_notice("[eleusis] Oath 1: I, " + target + ", of (environment),", "cyan");
    display_notice("[eleusis] Oath 2: Do hereby submit to the Wildwood Queen, Lady Gaia, She Who is Nature.", "cyan");
    display_notice("[eleusis] Oath 3: In life, I shall seek to serve Nature, to defend Her realm, and to strike back against those who would trespass upon Her until my final breath.", "cyan");
    display_notice("[eleusis] Oath 4: In death, I shall return to Her, my infested body a feast as my flesh is reclaimed down to the bone.", "cyan");
    display_notice("[eleusis] Oath 5: That which is borrowed from the earth shall be inevitably returned; in life, growth, death, and decay, I am one with Nature.", "cyan");
    break;
    
  case "16":
    textStep = "say Now come, " + target + ", and lay your hand upon the roots. They reach down from every tree of Eleusis, and they hold all of us together.";
    break;

  case "17":
    textStep = "cast illusion One by one, the wisps abandon their wandering and gather about the roots until their green light thickens and the gnarled wood seems to breathe.";
    break;

  case "18":
    textStep = "t " + target + " TOUCH ROOTS";
    break;
    
  case "19":
    textStep = "cast illusion The wisps lift from the roots in a joyful spiral, dancing along the vines before drifting slowly back to their quiet wandering amongs the roots and earth.";
    break;
    
  case "20":
    textStep = "say Congratulations, " + target + ", and welcome to our family :)";
    break;
}

if (textStep != "") {
  send_command(textStep);
  display_notice("Step " + step + " out of 20.");
} else {
  display_notice ("Wrong step: " + args[1]);
}