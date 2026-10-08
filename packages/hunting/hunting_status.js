var HU = client.loom.hunting;
var huPt = get_variable("hunting_party_target");
var huAf = get_variable("hunting_after_form");
display_notice("[hunting] class " + (HU.cls || "unknown") + ", dragon mode " + String(get_variable("hunting_dragon_mode")).toUpperCase()
  + " (" + get_variable("hunting_dragon_attack") + "), autogold " + String(get_variable("hunting_autogold")).toUpperCase()
  + ", party target " + (huPt ? huPt : "none") + ", after form " + (huAf ? huAf.toUpperCase() : "nothing")
  + ". HUNTING HELP for commands.", "cyan");
