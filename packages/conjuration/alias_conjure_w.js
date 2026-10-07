var sigil = args[1];

switch (sigil) {
  case "bauble":
    display_notice("[conjuration] Insufficient skill to create a scented bauble.", "orange");
    break;

  case "brooch":
    display_notice("[conjuration] Insufficient skill to create a brooch of Thoth.", "orange");
    break;

  case "comprehension":
    display_notice("[conjuration] Insufficient skill to create a necklace of comprehension.", "orange");

    break;

  case "concealment":
    display_notice("[conjuration] Insufficient skill to create an orb of concealment .", "orange");

    break;
    
  case "cube":
    display_notice("[conjuration] Insufficient skill to create a vibration-dampening cube.", "orange");

    break;

  case "dreamcatcher":
    display_notice("[conjuration] Insufficient skill to create a dreamcatcher.", "orange");

    break;

  case "eye":
    display_notice("[conjuration] Insufficient skill to create an eye sigil .", "orange");

    break;
    
  case "fist":
    send_command("outr silver");
    send_command("outr 2 horn");  
    send_command("put silver in ouroboros263287");
    send_command("put horn in ouroboros263287");
    send_command("put horn in ouroboros263287");
    send_command("begin creation of fist sigil");
    send_command("chant fartak ishla spooz tran");
    send_command("chant fartak ishla spooz tran");
    send_command("chant fartak ishla spooz tran");
    send_command("ring bell");
    send_command("end ritual");
    send_command("get sigil from ouroboros275085");
    break;
    
  case "flame":
    send_command("outr silver");
    send_command("put silver in ouroboros263287");
    send_command("begin creation of flame sigil");
    send_command("chant flet lhar abe minlo eec");
    send_command("chant flet lhar abe minlo eec");
    send_command("chant flet lhar abe minlo eec");
    send_command("ring bell");
    send_command("end ritual");
    send_command("get sigil from ouroboros275085");
    break;
    
  case "key":
    display_notice("[conjuration] Insufficient skill to create a key sigil.", "orange");

    break;
    
  case "monolith":
    display_notice("[conjuration] Insufficient skill to create a monolith sigil.", "orange");

    break;
    
  case "mushroom":
    display_notice("[conjuration] Insufficient skill to create a mushroom sigil.", "orange");

    break;
    
  case "negation":
    display_notice("[conjuration] Insufficient skill to create a gem of negation.", "orange");

    break;
    
  case "orb":
    display_notice("[conjuration] Insufficient skill to create a chaos-destroying orb.", "orange");

    break;
    
  case "pestilence":
    display_notice("[conjuration] Insufficient skill to create a ring of pestilence.", "orange");

    break;
    
  case "star":
    display_notice("[conjuration] Insufficient skill to create a star sigil.", "orange");

    break;
    
  case "stasis":
    display_notice("[conjuration] Insufficient skill to create a bag of stasis.", "orange");

    break;

  case "whirlwind":
    display_notice("[conjuration] Insufficient skill to create a whirlwind of Vastar.", "orange");

    break;

  default:
    display_notice("[conjuration] Invalid sigil. Should be one of: bauble, brooch, comprehension, concealment, cube, dreamcatcher, eye, fist, flame, key, monolith, mushroom, negation, orb, pestilence, star, statis, whirlwind.");
}