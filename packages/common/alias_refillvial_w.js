var elixir = args[1];

switch (elixir){
  case "health":
    send_command("fill vial133566 with health from rift");
    break;

  case "mana":
    send_command("fill vial125267 with mana from rift");
    break;

  case "mending":
    send_command("fill vial134886 with mending from rift");
    break;

  case "venom":
    send_command("fill vial135919 with venom from rift");
    break;

  case "caloric":
    send_command("fill vial138895 with caloric from rift");
    break;

  case "frost":
    send_command("fill vial314996 with frost from rift");
    break;

  case "immunity":
    send_command("fill vial321329 with immunity from rift");
    break;

  case "levitation":
    send_command("fill vial21165 with levitation from rift");
    break;

  case "mass":
    send_command("fill vial433721 with mass from rift");
    break;

  case "speed":
    send_command("fill vial177369 with speed from rift");
    break;

  case "restoration":
    send_command("fill vial32277 with restoration from rift");
    break;

  case "epidermal":
    send_command("fill vial81690 with epidermal from rift");
    break;

  case "all":
    send_command("fill vial133566 with health from rift");
    send_command("fill vial125267 with mana from rift");
    send_command("fill vial134886 with mending from rift");
    send_command("fill vial135919 with venom from rift");
    send_command("fill vial138895 with caloric from rift");
    send_command("fill vial314996 with frost from rift");
    send_command("fill vial321329 with immunity from rift");
    send_command("fill vial21165 with levitation from rift");
    send_command("fill vial433721 with mass from rift");
    send_command("fill vial177369 with speed from rift");
    send_command("fill vial32277 with restoration from rift");
    send_command("fill vial81690 with epidermal from rift");
    break;
}