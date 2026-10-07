var activeClass = get_variable("activeClass");

// Common for all classes - PRIO 1
send_command("hs_render");

switch (activeClass) {
  case "Druid":
    send_command("morph wyvern");
    send_command("queue add eq embrace spirit");
    send_command("queue add equilibrium summon fire");
    send_command("flail staff");
    break;

  case "Magi":
    send_command("queue add eq simultaneity");
    send_command("wield staff");
    break;
    
  case "Black Dragon":
  case "Blue Dragon":
    send_command("dragonarmour");
    break;
}

// Common for all classes - PRIO 2
send_command("selfishness");
send_command("avoid physical");
send_command("insomnia");
