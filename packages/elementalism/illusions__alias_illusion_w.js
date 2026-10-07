var illusionType = args[1];

switch (illusionType) {
  case "mosstattoo":
    send_command("cast illusion A moss tattoo fades from view and disappears.");
    break;

  default:
    display_notice("[elementalism] Invalid Illusion", "orange");
}