var illusionType = args[1];
var illusionTarget = args[2];

switch (illusionType) {
  case "mosstattoo":
    send_command("cast illusion " + illusionTarget + " A moss tattoo fades from view and disappears.");
    break;

  default:
    display_notice("[elementalism] Invalid Illusion", "orange");
}