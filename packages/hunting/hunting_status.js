var HU = client.loom.hunting;
run_function("hunting_mainlist", [], "hunting");
var huPt = get_variable("hunting_party_target");
var huAf = get_variable("hunting_after_form");
display_notice("[hunting] class " + (HU.cls || "unknown") + (HU.cls && !(HU.classes && HU.classes[HU.cls]) ? " (not configured yet)" : "") + ", dragon mode " + String(get_variable("hunting_dragon_mode")).toUpperCase()
  + " (" + get_variable("hunting_dragon_attack") + "), autogold " + String(get_variable("hunting_autogold")).toUpperCase()
  + (HU.mainNow ? ", main attack " + HU.mainNow.name.toUpperCase() : "")
  + ", party target " + (huPt ? huPt : "none") + ", after form " + (huAf ? huAf.toUpperCase() : "nothing")
  + ". HUNTING HELP for commands.", "cyan");
