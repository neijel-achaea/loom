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
else if (huSub === "pk") {
  // HUNTING PK [ON|OFF|LIST|SET F<n> <label> <command>|CLEAR F<n>|CLEAR ALL [CONFIRM]] (#342, early).
  var huPw = huRest.split(/\s+/);
  var huPv = (huPw[0] || "").toLowerCase();
  var huCls = HU.cls || "";
  var huPkT = HU.pkFor(huCls);
  var huPkN = 0; for (var huPq in huPkT) if (huPkT.hasOwnProperty(huPq)) huPkN++;
  var huFk = function (s) { var m = /^f?(\d{1,2})$/i.exec(String(s || "")); var n = m ? to_number(m[1]) : 0; return n >= 1 && n <= 12 ? n : 0; };
  if (huPv === "" || huPv === "on" || huPv === "off") {
    var huOn = huPv === "" ? !HU.pk : huPv === "on";
    if (huOn === HU.pk) display_notice("[hunting] PK MODE is already " + (HU.pk ? "ON" : "OFF") + ".", C);
    else {
      HU.pk = huOn;
      // The basher stops on the way into PK (Ricardo): it hunts denizens.
      var huB = client.loom.basher;
      if (huOn && huB && huB.on && huB.stop) huB.stop("[basher] OFF: PK MODE.", "orange");
      run_function("hunting_buttons", [], "hunting");
      if (huOn) display_notice("[hunting] PK MODE ON: " + (huPkN ? huPkN + " PK key" + (huPkN === 1 ? "" : "s") + " for " + (huCls || "this class") + ", the rest as in hunting" : "no PK keys set for " + (huCls || "this class") + " yet (HUNTING PK SET F<n> <label> <command>)") + ". Ctrl+F12 or HUNTING PK to switch back.", "lime");
      else display_notice("[hunting] PK MODE OFF: hunting keys back.", "lime");
    }
  } else if (huPv === "list") {
    var huL = [];
    for (var huLi = 1; huLi <= 12; huLi++) { var huLr = huPkT[String(huLi)]; if (huLr) huL.push("F" + huLi + " " + huLr[0] + " = " + huLr[1]); }
    display_notice("[hunting] PK MODE " + (HU.pk ? "ON" : "OFF") + "; PK keys for " + (huCls || "this class") + ": " + (huL.length ? huL.join(" · ") : "none") + ". HUNTING PK SET F<n> <label> <command>.", C);
  } else if (huPv === "set") {
    var huSk = huFk(huPw[1]), huSl = huPw[2] || "", huSc = huPw.slice(3).join(" ");
    if (!huCls) display_notice("[hunting] your class isn't known yet (it comes from GMCP at login, or SCORE).", "orange");
    else if (!huSk || !huSl || !huSc) display_notice("[hunting] HUNTING PK SET F<1-12> <label> <command>, e.g. HUNTING PK SET F3 Ague staffcast ague at @tar. The label is one word.", "orange");
    else {
      if (!HU.pkKeys[huCls]) HU.pkKeys[huCls] = {};
      HU.pkKeys[huCls][String(huSk)] = [huSl, huSc];
      HU.pkSave();
      if (HU.pk) run_function("hunting_buttons", [], "hunting");
      display_notice("[hunting] PK key F" + huSk + " for " + huCls + ": " + huSl + " = " + huSc + ".", "lime");
    }
  } else if (huPv === "clear") {
    var huCk = huFk(huPw[1]);
    if ((huPw[1] || "").toLowerCase() === "all") {
      if ((huPw[2] || "").toLowerCase() !== "confirm") display_notice("[hunting] this clears " + (huPkN === 1 ? "the PK key" : "all " + huPkN + " PK keys") + " for " + (huCls || "this class") + ". HUNTING PK CLEAR ALL CONFIRM to go ahead.", "orange");
      else { delete HU.pkKeys[huCls]; HU.pkSave(); if (HU.pk) run_function("hunting_buttons", [], "hunting"); display_notice("[hunting] PK keys for " + (huCls || "this class") + " cleared.", "orange"); }
    } else if (!huCk) display_notice("[hunting] HUNTING PK CLEAR F<1-12>, or CLEAR ALL CONFIRM.", "orange");
    else if (!huPkT[String(huCk)]) display_notice("[hunting] no PK key on F" + huCk + " for " + (huCls || "this class") + ".", C);
    else { delete HU.pkKeys[huCls][String(huCk)]; HU.pkSave(); if (HU.pk) run_function("hunting_buttons", [], "hunting"); display_notice("[hunting] PK key F" + huCk + " cleared: it's the hunting key again.", "lime"); }
  } else {
    display_notice("[hunting] HUNTING PK [ON|OFF], PK LIST, PK SET F<n> <label> <command>, PK CLEAR F<n> | ALL.", "orange");
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
else if (huSub === "highlight") {
  // One switch for every key (Ricardo, #409): off = nothing lights, the
  // basher's STOP key included.
  if (huVal === "on" || huVal === "off") {
    set_variable("hunting_highlight", huVal);
    run_function("hunting_buttons", [], "hunting");
    display_notice("[hunting] F-key highlights " + huVal.toUpperCase() + ".", "lime");
  } else if (huVal === "") {
    display_notice("[hunting] F-key highlights are " + (get_variable("hunting_highlight") == "off" ? "OFF" : "ON") + ". HUNTING HIGHLIGHT ON or OFF.", C);
  } else {
    display_notice("[hunting] highlights are ON or OFF.", "orange");
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
  // Dragons (#386): F1 is Gut or Incantation, picked by the dragon mode,
  // not a list of main attacks. GUT, INCANTATION and AUTO set the mode;
  // nothing can be added (it would change the basher's attack but not F1).
  var huF1 = ((HU.classes[HU.cls] || {}).keys || [])[0];
  var huDrg = !!(huF1 && huF1[0] === "{DRAGON}");
  var huDmodes = { gut: "physical", phy: "physical", physical: "physical", incantation: "magical", mag: "magical", magical: "magical", auto: "auto" };
  if (!HU.cls) {
    display_notice("[hunting] no class seen yet.", "orange");
  } else if (huDrg && huMcmd !== null) {
    display_notice("[hunting] a dragon's F1 is Gut or Incantation, picked by the dragon mode: nothing can be added. HUNTING MAIN GUT, INCANTATION or AUTO.", "orange");
  } else if (huDrg && huMname !== "" && !huDmodes[huMname]) {
    display_notice("[hunting] no main attack " + huMname.toUpperCase() + " for " + HU.cls + ": GUT, INCANTATION or AUTO.", "orange");
  } else if (huDrg && huMname !== "") {
    // The same as HUNTING DRAGONMODE with that mode.
    var huDnext = huDmodes[huMname];
    set_variable("hunting_dragon_mode", huDnext);
    if (huDnext === "physical") set_variable("hunting_dragon_attack", "gut");
    if (huDnext === "magical") set_variable("hunting_dragon_attack", "incantation");
    if (huDnext === "auto") run_function("hunting_dragon_best", [], "hunting");
    display_notice("[hunting] dragon mode " + huDnext.toUpperCase() + ": attacking with " + get_variable("hunting_dragon_attack") + ".", "lime");
    run_function("hunting_buttons", [], "hunting");
  } else if (huDrg) {
    var huDm = String(get_variable("hunting_dragon_mode") || "auto");
    var huDa = String(get_variable("hunting_dragon_attack") || "gut");
    display_notice("[hunting] main attack for " + HU.cls + ": " + (huDm === "physical" ? "*GUT, INCANTATION, AUTO" : huDm === "magical" ? "GUT, *INCANTATION, AUTO" : "GUT, INCANTATION, *AUTO (now " + huDa.toUpperCase() + ")") + ", the dragon mode (F8). HUNTING MAIN <name> to switch.", C);
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
