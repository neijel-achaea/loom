var debug = get_variable("debug");
var currentDragonMode = get_variable("dragonMode");
var newDragonMode = "auto"; // in case dragonMode is empty
var dragonAttack = get_variable("dragonAttack");

if (currentDragonMode == "physical") { 
  newDragonMode = "magical"; 
  dragonAttack = "incantation";
  set_variable("dragonAttack", dragonAttack);
  set_variable("dragonMode", newDragonMode);
  if (debug == "on") display_notice("[debug][hunting][dragonmode] dragonAttack set to " + dragonAttack + "; dragonMode set to " + newDragonMode, "cyan")
}

if (currentDragonMode == "magical") { 
  newDragonMode = "auto"; 
  set_variable("dragonMode", newDragonMode);
  run_function("best_dragon_mode", [], "hunting");
  if (debug == "on") display_notice("[debug][hunting][dragonmode] dragonMode set to " + newDragonMode, "cyan")

}

if (currentDragonMode == "auto") { 
  newDragonMode = "physical"; 
  dragonAttack = "gut";
  set_variable("dragonAttack", dragonAttack);
  set_variable("dragonMode", newDragonMode);
  if (debug == "on") display_notice("[debug][hunting][dragonmode] dragonAttack set to " + dragonAttack + "; dragonMode set to " + newDragonMode, "cyan")
}

run_function("set_buttons", [], "hunting");