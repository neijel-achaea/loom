// RIPPLES [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.ripples || !client.loom.ripples.line) run_function("ripples_setup", [], "ripples");
var R = client.loom.ripples;
var rpRaw = String(args[1] || "").trim();
var rpA = rpRaw.toLowerCase().split(/\s+/);
var rpRest = rpRaw.replace(/^\S+\s*/, "");
if (rpA[0] === "" || rpA[0] === "status") {
  run_function("ripples_status", [], "ripples");
} else if (rpA[0] === "help") {
  run_function("ripples_help", [], "ripples");
} else if (rpA[0] === "poll" && rpA[1] === "off") {
  R.poll = 0;
  set_variable("ripples_poll", "off");
  R.say("POLL OFF: WADE STATUS is read only when you type it (no wave progress, lives or affixes otherwise).", "lime");
} else if (rpA[0] === "poll" && /^\d+$/.test(rpA[1] || "") && parseInt(rpA[1], 10) >= 10) {
  R.poll = parseInt(rpA[1], 10);
  set_variable("ripples_poll", String(R.poll));
  R.due = Math.min(R.due, Date.now() + R.poll * 1000);
  R.say("POLL " + R.poll + ": WADE STATUS is asked quietly every " + R.poll + "s in a ripple, after GO! and after kills.", "lime");
} else if (rpA[0] === "poll") {
  R.say("RIPPLES POLL <seconds, 10 or more>|OFF (now " + (R.poll ? R.poll + "s" : "OFF") + ").", "orange");
} else if (rpA[0] === "view" && /^(wade|ripples|boons|affixes|runs)$/.test(rpA[1] || "")) {
  R.view = rpA[1];
  run_function("ripples_render", [], "ripples");
} else if (rpA[0] === "view") {
  R.say("RIPPLES VIEW WADE|RIPPLES|BOONS|AFFIXES|RUNS.", "orange");
} else if (rpA[0] === "name") {
  // Names the place of the ripple you're in, or the last one.
  var rpSrc = R.run && R.run.ripples.length ? R.run : (R.runs.length ? R.runs[R.runs.length - 1] : null);
  var rpRip = rpSrc && rpSrc.ripples.length ? rpSrc.ripples[rpSrc.ripples.length - 1] : null;
  if (!rpRip || !rpRip.intro) R.say("no ripple with a place line to name yet.", "orange");
  else if (!rpRest) R.say("RIPPLES NAME <name>: names \"" + rpRip.intro + "\" (now " + R.place(rpRip) + ").", "orange");
  else if (rpA[1] === "default") { delete R.names[rpRip.intro]; set_variable("ripples_names", JSON.stringify(R.names)); R.say("that place is " + R.place(rpRip) + " again.", "lime"); run_function("ripples_render", [], "ripples"); }
  else { R.names[rpRip.intro] = rpRest.slice(0, 40); set_variable("ripples_names", JSON.stringify(R.names)); R.say("that place is now " + R.names[rpRip.intro] + ".", "lime"); run_function("ripples_render", [], "ripples"); }
} else if (rpA[0] === "took") {
  // Sets the boon of the last claim it couldn't tell.
  var rpS = null;
  if (R.run) for (var rpI = R.run.screens.length - 1; rpI >= 0; rpI--) if (R.run.screens[rpI].took) { rpS = R.run.screens[rpI]; break; }
  var rpPick = "";
  if (rpS) for (var rpJ = 0; rpJ < rpS.opts.length; rpJ++) if (rpS.opts[rpJ].toLowerCase() === rpRest.toLowerCase()) rpPick = rpS.opts[rpJ];
  if (!rpS) R.say("no claim in this run to set.", "orange");
  else if (!rpPick) R.say("the last screen offered: " + rpS.opts.join(", ") + ". RIPPLES TOOK <one of them>.", "orange");
  else {
    if (rpS.took && rpS.took !== "?" && rpS.took !== rpPick) { var rpH = R.run.held.indexOf(rpS.took); if (rpH >= 0) R.run.held.splice(rpH, 1); }
    rpS.took = rpPick;
    if (rpPick !== "Restoration" && R.run.held.indexOf(rpPick) < 0) R.run.held.push(rpPick);
    R.save();
    R.say("last claim: " + rpPick + ".", "lime");
    run_function("ripples_render", [], "ripples");
  }
} else if (rpA[0] === "end") {
  if (!R.run) R.say("no run under way.", "orange");
  else R.endRun(rpA[1] === "died" ? "died" : "left");
} else if (rpA[0] === "wipe") {
  if (rpA[rpA.length - 1] !== "confirm") R.say("WIPE forgets " + R.runs.length + " runs, every boon and affix seen, and the run under way. RIPPLES WIPE CONFIRM to do it.", "orange");
  else {
    R.runs = []; R.run = null; R.codex = { boons: {}, affixes: {} }; R.cap = null; R.ccap = null; R.scr = null;
    R.saveAll();
    R.say("wiped.", "lime");
    run_function("ripples_render", [], "ripples");
  }
} else if (rpA[0] === "reset") {
  R.save();
  R.cap = null; R.ccap = null; R.scr = null; R.count = null; R.intro = ""; R.asked = 0; R.due = 0;
  R.runs = null; R.run = undefined; R.codex = null; R.names = null;
  run_function("ripples_setup", [], "ripples");
  R.say("reset: captures cleared, runs and codex reloaded from saved variables.", "lime");
  run_function("ripples_render", [], "ripples");
} else if (rpA[0] === "debug") {
  var rpC = R.cur();
  R.say("run=" + (R.run ? "open, " + R.run.ripples.length + " ripples, " + R.run.screens.length + " screens, lives " + R.run.lives : "none") + " cur=" + (rpC ? JSON.stringify(rpC) : "-") + " cap=" + (R.cap ? JSON.stringify(R.cap) : "-") + " ccap=" + (R.ccap ? R.ccap.text.length + " lines" : "-") + " scr=" + (R.scr ? JSON.stringify(R.scr) : "-") + " count=" + R.count + " poll=" + R.poll + " due in " + Math.round((R.due - Date.now()) / 1000) + "s runs=" + R.runs.length + " boons=" + Object.keys(R.codex.boons).length + " affixes=" + Object.keys(R.codex.affixes).length, "cyan");
} else {
  R.say("unknown command '" + rpA[0] + "'. RIPPLES HELP for commands.", "orange");
}
