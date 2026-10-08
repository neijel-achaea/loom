var debug = get_variable("debug");
// Class comes from hunting's own onGMCP; the shared variable is the fallback
// until a Char.Status message has arrived this session.
var activeClass = (client.loom && client.loom.hunting && client.loom.hunting.cls) || get_variable("activeClass");
var dragonMode = get_variable("dragonMode");
var dragonAttack = get_variable("dragonAttack");

var my_ep = get_variable("my_ep");
var my_wp = get_variable("my_wp");
var my_maxep = get_variable("my_maxep");
var my_maxwp = get_variable("my_maxwp");

if (activeClass == "Black Dragon" && dragonMode == "auto") {
  
  var pctEP = my_ep / my_maxep;
  var pctWP = my_wp / my_maxwp;

  if (pctEP > pctWP) { 
    dragonAttack = "gut";
  } else {
    dragonAttack = "incantation";
  }
  
  set_variable("dragonAttack", dragonAttack);
  if (debug == "on") display_notice("[debug][hunting][best_dragon_mode] Dragon Attack set to " + dragonAttack, "cyan");
} 