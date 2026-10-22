// HUNTING [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
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
    display_notice("[hunting] dragon mode " + huNext.toUpperCase() + ": attacking with " + get_variable("hunting_dragon_attack") + ".", "lime");
    run_function("hunting_buttons", [], "hunting");
  }
}
else if (huSub === "autogold") {
  if (huVal === "on" || huVal === "off" || huVal === "all") {
    set_variable("hunting_autogold", huVal);
    display_notice("[hunting] autogold " + huVal.toUpperCase() + ".", "lime");
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
    display_notice("[hunting] party target " + (huVal === "off" ? "cleared" : "set to " + huVal) + ".", "lime");
    run_function("hunting_buttons", [], "hunting");
  }
}
else if (huSub === "afterform") {
  if (huVal === "") {
    var huAf = get_variable("hunting_after_form");
    display_notice("[hunting] after dragonform rises or falls: " + (huAf ? huAf.toUpperCase() : "nothing") + ". HUNTING AFTERFORM <command> or OFF.", C);
  } else {
    set_variable("hunting_after_form", huVal === "off" ? "" : huRest);
    display_notice("[hunting] after dragonform rises or falls: " + (huVal === "off" ? "nothing" : huRest.toUpperCase()) + ".", "lime");
  }
}
else if (huSub === "main") {
  // HUNTING MAIN: list; HUNTING MAIN <name>: use it; HUNTING MAIN <name> =
  // <command>: add or replace one for this class; HUNTING MAIN <name> = (empty):
  // remove an added one.
  run_function("hunting_mainlist", [], "hunting");
  var huMeq = huRest.indexOf("=");
  var huMname = (huMeq >= 0 ? huRest.substring(0, huMeq) : huRest).trim().toLowerCase().replace(/\s+/g, "");
  var huMcmd = huMeq >= 0 ? huRest.substring(huMeq + 1).trim() : null;
  if (!HU.cls) {
    display_notice("[hunting] no class seen yet.", "orange");
  } else if (huMname === "") {
    var huMout = [];
    for (var huMi = 0; huMi < HU.mainList.length; huMi++) {
      var huMr = HU.mainList[huMi];
      huMout.push((HU.mainNow && HU.mainNow.name == huMr.name ? "*" : "") + huMr.name.toUpperCase() + (huMr.added ? " (added)" : ""));
    }
    display_notice("[hunting] main attacks for " + HU.cls + ": " + (huMout.length ? huMout.join(", ") : "none") + ". HUNTING MAIN <name> to use one, HUNTING MAIN <name> = <command> to add one.", C);
  } else if (huMcmd !== null) {
    if (!HU.mainsAdded[HU.cls]) HU.mainsAdded[HU.cls] = {};
    if (huMcmd === "") {
      delete HU.mainsAdded[HU.cls][huMname];
      display_notice("[hunting] removed the added " + huMname.toUpperCase() + " for " + HU.cls + ".", "lime");
    } else {
      HU.mainsAdded[HU.cls][huMname] = huMcmd;
      HU.mains[HU.cls] = huMname;
      set_variable("hunting_mains", JSON.stringify(HU.mains));
      display_notice("[hunting] " + huMname.toUpperCase() + " = " + huMcmd + ", now your main attack as " + HU.cls + ".", "lime");
    }
    set_variable("hunting_mains_added", JSON.stringify(HU.mainsAdded));
    run_function("hunting_buttons", [], "hunting");
  } else {
    var huMfound = false;
    for (var huMj = 0; huMj < HU.mainList.length; huMj++) if (HU.mainList[huMj].name == huMname) huMfound = true;
    if (!huMfound) {
      display_notice("[hunting] no main attack " + huMname.toUpperCase() + " for " + HU.cls + ". HUNTING MAIN lists them.", "orange");
    } else {
      HU.mains[HU.cls] = huMname;
      set_variable("hunting_mains", JSON.stringify(HU.mains));
      run_function("hunting_buttons", [], "hunting");
      display_notice("[hunting] main attack for " + HU.cls + ": " + huMname.toUpperCase() + ".", "lime");
    }
  }
}
else if (huSub === "toggle") {
  // Class toggles (classes/*.js "toggles"): flip, or set ON/OFF, and send
  // that state's commands.
  var huTp = huVal.split(/\s+/);
  var huTn = huTp[0] || "";
  var huTset = huTp[1] || "";
  var huTcls = HU.classes[HU.cls];
  var huTdef = huTcls && huTcls.toggles ? huTcls.toggles[huTn] : null;
  if (!huTdef) {
    var huTnames = [];
    for (var huTk in ((huTcls && huTcls.toggles) || {})) huTnames.push(huTk.toUpperCase());
    display_notice("[hunting] " + (huTnames.length ? "toggles for " + HU.cls + ": " + huTnames.join(", ") + "." : "no toggles for " + (HU.cls || "this class") + "."), huTn ? "orange" : C);
  } else if (huTset !== "" && huTset !== "on" && huTset !== "off") {
    display_notice("[hunting] HUNTING TOGGLE " + huTn.toUpperCase() + " [ON|OFF].", "orange");
  } else {
    var huTnow = HU.toggles[huTn] === "on" ? "on" : "off";
    var huTnext = huTset || (huTnow === "on" ? "off" : "on");
    var huTcmds = huTdef[huTnext] || [];
    for (var huTi = 0; huTi < huTcmds.length; huTi++) send_command(huTcmds[huTi]);
    HU.toggles[huTn] = huTnext;
    set_variable("hunting_toggles", JSON.stringify(HU.toggles));
    run_function("hunting_buttons", [], "hunting");
    display_notice("[hunting] " + (huTdef.label || huTn) + " " + huTnext.toUpperCase() + ".", "lime");
  }
}
else if (huSub === "buttons") {
  run_function("hunting_buttons", [], "hunting");
  display_notice("[hunting] F-keys laid out for " + (HU.cls || "no class yet") + ".", C);
}
else if (huSub === "rage") {
  display_notice("[hunting] rage " + HU.rage + ", global cooldown " + (HU.glob ? "clear" : "running" + (HU.globAt ? " (" + Math.round((Date.now() - HU.globAt) / 1000) + "s)" : "")), C);
  display_notice("  slots: " + JSON.stringify(HU.slots), C);
  display_notice("  cooldowns: " + JSON.stringify(HU.cd), C);
}
else if (huSub === "reset") {
  HU.cd = {};
  HU.glob = true;
  run_function("hunting_setup", [], "hunting");
  run_function("hunting_buttons", [], "hunting");
  display_notice("[hunting] reset: rage cooldowns cleared, F-keys laid out again. Settings are kept.", "lime");
}
else if (huSub === "debug") {
  display_notice("[hunting] cls=" + HU.cls + " bal=" + HU.bal + " eq=" + HU.eq
    + " ep=" + HU.ep + "/" + HU.maxep + " wp=" + HU.wp + "/" + HU.maxwp
    + " main=" + JSON.stringify(HU.main) + " spec=" + HU.spec + " toggles=" + JSON.stringify(HU.toggles) + " kill=" + HU.kill, C);
}
else {
  display_notice("[hunting] unknown command '" + huSub + "'. HUNTING HELP for commands.", "orange");
}
