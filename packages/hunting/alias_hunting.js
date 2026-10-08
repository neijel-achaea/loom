// HUNTING [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.hunting || !client.loom.hunting.costs) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
var huRaw = String(args[1] || "").trim();
var huSub = huRaw.split(/\s+/)[0].toLowerCase();
var huRest = huRaw.substring(huSub.length).trim();
var huVal = huRest.toLowerCase();
var C = "cyan";

if (huSub === "" || huSub === "status") {
  run_function("hunting_status", [], "hunting");
}
else if (huSub === "help") {
  run_function("hunting_help", [], "hunting");
}
else if (huSub === "dragonmode") {
  var huCur = get_variable("hunting_dragon_mode");
  var huNext = huVal;
  if (huNext === "") huNext = (huCur == "auto") ? "physical" : (huCur == "physical") ? "magical" : "auto";
  if (huNext === "phy") huNext = "physical";
  if (huNext === "mag") huNext = "magical";
  if (huNext === "aut") huNext = "auto";
  if (huNext !== "physical" && huNext !== "magical" && huNext !== "auto") {
    display_notice("[hunting] dragon mode is PHYSICAL, MAGICAL or AUTO.", "orange");
  } else {
    set_variable("hunting_dragon_mode", huNext);
    if (huNext === "physical") set_variable("hunting_dragon_attack", "gut");
    if (huNext === "magical") set_variable("hunting_dragon_attack", "incantation");
    if (huNext === "auto") run_function("hunting_dragon_best", [], "hunting");
    display_notice("[hunting] dragon mode " + huNext.toUpperCase() + ": attacking with " + get_variable("hunting_dragon_attack") + ".", C);
    run_function("hunting_buttons", [], "hunting");
  }
}
else if (huSub === "autogold") {
  if (huVal === "on" || huVal === "off" || huVal === "all") {
    set_variable("hunting_autogold", huVal);
    display_notice("[hunting] autogold " + huVal.toUpperCase() + ".", C);
  } else if (huVal === "") {
    display_notice("[hunting] autogold is " + String(get_variable("hunting_autogold")).toUpperCase() + ". HUNTING AUTOGOLD ON (your kills), ALL (any gold) or OFF.", C);
  } else {
    display_notice("[hunting] autogold is ON, ALL or OFF.", "orange");
  }
}
else if (huSub === "partytarget") {
  if (huVal === "") {
    var huPt = get_variable("hunting_party_target");
    display_notice("[hunting] party target: " + (huPt ? huPt : "none") + ". HUNTING PARTYTARGET <name> or OFF.", C);
  } else {
    set_variable("hunting_party_target", huVal === "off" ? "" : huVal);
    display_notice("[hunting] party target " + (huVal === "off" ? "cleared" : "set to " + huVal) + ".", C);
    run_function("hunting_buttons", [], "hunting");
  }
}
else if (huSub === "afterform") {
  if (huVal === "") {
    var huAf = get_variable("hunting_after_form");
    display_notice("[hunting] after dragonform rises or falls: " + (huAf ? huAf.toUpperCase() : "nothing") + ". HUNTING AFTERFORM <command> or OFF.", C);
  } else {
    set_variable("hunting_after_form", huVal === "off" ? "" : huRest);
    display_notice("[hunting] after dragonform rises or falls: " + (huVal === "off" ? "nothing" : huRest.toUpperCase()) + ".", C);
  }
}
else if (huSub === "buttons") {
  run_function("hunting_buttons", [], "hunting");
  display_notice("[hunting] F-keys laid out for " + (HU.cls || "no class yet") + ".", C);
}
else if (huSub === "rage") {
  display_notice("[hunting] rage " + HU.rage + ", global cooldown " + (HU.glob ? "clear" : "running"), C);
  display_notice("  slots: " + JSON.stringify(HU.slots), C);
  display_notice("  cooldowns: " + JSON.stringify(HU.cd), C);
}
else if (huSub === "reset") {
  HU.cd = {};
  HU.glob = true;
  run_function("hunting_setup", [], "hunting");
  run_function("hunting_buttons", [], "hunting");
  display_notice("[hunting] reset: rage cooldowns cleared, F-keys laid out again. Settings are kept.", C);
}
else if (huSub === "debug") {
  display_notice("[hunting] cls=" + HU.cls + " bal=" + HU.bal + " eq=" + HU.eq
    + " ep=" + HU.ep + "/" + HU.maxep + " wp=" + HU.wp + "/" + HU.maxwp
    + " main=" + JSON.stringify(HU.main) + " kill=" + HU.kill, C);
}
else {
  display_notice("[hunting] unknown command '" + huSub + "'. HUNTING HELP for commands.", "orange");
}
