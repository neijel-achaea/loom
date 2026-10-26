// QUESTBOOK [subcommand ...]: the one command for this package. Writing a quest
// down: QUESTBOOK NEW <name> opens it, then QUESTBOOK STEP … adds steps to the
// quest open in the tab.
if (!client.loom || !client.loom.questbook || !client.loom.questbook.list) run_function("questbook_setup", [], "questbook");
var QU = client.loom.questbook;
var quRaw = String(args[1] || "").trim();
var quSp = quRaw.search(/\s/);
var quCmd = (quSp < 0 ? quRaw : quRaw.substring(0, quSp)).toLowerCase();
var quRest = quSp < 0 ? "" : quRaw.substring(quSp).trim();
var quOpen = QU.open ? QU.byId(QU.open) : null;
var quQ;
function quNeedOpen() {
  if (!quOpen) QU.say("no quest open: QUESTBOOK OPEN <name|number>, or QUESTBOOK NEW <name>.", "orange");
  return !!quOpen;
}
if (quCmd === "" || quCmd === "status") {
  var quN = { going: 0, ready: 0, waiting: 0, done: 0 };
  for (var quI = 0; quI < QU.list.length; quI++) quN[QU.status(QU.list[quI])]++;
  var quF = QU.followed();
  QU.say(QU.list.length + (QU.list.length === 1 ? " quest" : " quests") + ": " + quN.going + " under way, " + quN.ready + " ready, " + quN.waiting + " waiting" + (quN.done ? ", " + quN.done + " done for good" : "") + ". " +
    (quF ? "Following " + quF.name + " (step " + (QU.st(quF).step + 1) + " of " + quF.steps.length + "). " : "") + "Monthly reset at " + QU.midnight + "; " + (QU.year ? "1st Sarapin known" : "1st Sarapin not known yet (type DATE)") + ". QUESTBOOK LIST, QUESTBOOK HELP.", "cyan");
} else if (quCmd === "help") {
  run_function("questbook_help", [], "questbook");
} else if (quCmd === "list") {
  if (!QU.list.length) QU.say("no quests yet: QUESTBOOK NEW <name> starts one.", "cyan");
  for (var quJ = 0; quJ < QU.list.length; quJ++) {
    var quL = QU.list[quJ], quS = QU.status(quL), quRa = QU.readyAt(quL);
    QU.say(quL.id + ". " + quL.name + " (" + (quL.area || "?") + ", " + QU.repeatText(quL.repeat) + ", " + quL.steps.length + (quL.steps.length === 1 ? " step" : " steps") + "): " +
      (quS === "going" ? "step " + (QU.st(quL).step + 1) + " of " + quL.steps.length : (quS === "ready" ? "ready" : (quS === "done" ? "done, doesn't repeat" : "again in " + QU.span(quRa - Date.now()).toLowerCase()))), "cyan");
  }
} else if (quCmd === "new") {
  if (!quRest) QU.say("QUESTBOOK NEW <name>.", "orange");
  else if (/^\d+$/.test(quRest)) QU.say("give it a name, not a number: the number is the quest's.", "orange");
  else if (QU.byName(quRest)) QU.say(QU.byName(quRest).name + " is taken: pick another name.", "orange");
  else {
    quQ = { id: QU.nextId(), name: quRest, area: (QU.here && QU.here.area) || "", repeat: "daily", at: Date.now(), rewards: { renown: 0, xp: 0, gold: 0, items: [] }, steps: [] };
    QU.list.push(quQ);
    QU.save();
    QU.openQuest(quQ, true);
    QU.say("new quest " + quQ.name + " (" + quQ.id + (quQ.area ? ", " + quQ.area : "") + ", repeats daily: every hour; QUESTBOOK REPEAT to change it). Add its steps with QUESTBOOK STEP …: GO saves this room. Nothing ticks while you write it; START OVER in the tab follows it.", "lime");
  }
} else if (quCmd === "open") {
  quQ = QU.find(quRest);
  if (quQ) QU.openQuest(quQ);
  else QU.say("no quest '" + quRest + "'. QUESTBOOK OPEN <name|number>.", "orange");
} else if (quCmd === "close") {
  QU.openQuest(null);
} else if (quCmd === "step") {
  if (quNeedOpen()) {
    // STEP <kind> …, STEP EDIT <n> <kind> …, STEP INSERT <n> <kind> …,
    // STEP REMOVE <n>.
    var quSm = /^(edit|insert|remove|del)(?:\s+(\d+))?(?:\s+(.*))?$/i.exec(quRest);
    var quOp = quSm ? quSm[1].toLowerCase() : "add";
    var quNo = quSm ? Number(quSm[2] || 0) : 0, quMax = quOpen.steps.length;
    if (quOp === "del") quOp = "remove";
    if (quOp !== "add" && (!quNo || quNo < 1 || quNo > (quOp === "insert" ? quMax + 1 : quMax))) {
      QU.say(quMax || quOp === "insert" ? "QUESTBOOK STEP " + quOp.toUpperCase() + " <1-" + (quOp === "insert" ? quMax + 1 : quMax) + ">" + (quOp === "remove" ? "" : " <kind> …") + "." : quOpen.name + " has no steps yet.", "orange");
    } else if (quOp === "remove") {
      QU.removeStep(quOpen, quNo - 1);
    } else {
      var quPs = QU.parseStep(quOp === "add" ? quRest : (quSm[3] || ""), quOp === "edit" ? quOpen.steps[quNo - 1] : null);
      if (quPs.err) QU.say(quPs.err, "orange");
      else if (quOp === "add") QU.addStep(quOpen, quPs.step);
      else QU.putStep(quOpen, quNo - 1, quPs.step, quOp === "insert");
    }
  }
} else if (quCmd === "next") {
  var quFn = QU.followed();
  if (!quFn) QU.say("not following a quest: QUESTBOOK OPEN one you can do.", "orange");
  else if (!QU.current(quFn)) QU.say(quFn.name + " has no steps yet.", "orange");
  else QU.tick("Ticked by hand");
} else if (quCmd === "back") {
  var quFb = QU.followed();
  if (!quFb || !QU.back(quFb)) QU.say("nothing to step back from.", "orange");
  else QU.say(quFb.name + ": back to step " + (QU.st(quFb).step + 1) + ".", "lime");
} else if (quCmd === "restart") {
  if (quNeedOpen()) { QU.restart(quOpen); QU.say(quOpen.name + ": started over.", "lime"); QU.check(); }
} else if (quCmd === "done") {
  if (quNeedOpen()) QU.finish(quOpen);
} else if (quCmd === "repeat") {
  var quRp = quRest.toLowerCase();
  if (quRp === "off" || quRp === "once") quRp = "none";
  if (!quNeedOpen()) {}
  else if (QU.repeats.indexOf(quRp) >= 0) { quOpen.repeat = quRp; QU.save(); QU.say(quOpen.name + (quRp === "none" ? " doesn't repeat: once done, it stays done" : " repeats " + quRp + " (" + QU.repeatWhen(quRp) + ")") + ".", "lime"); }
  else QU.say(quOpen.name + (quOpen.repeat === "none" ? " doesn't repeat" : " repeats " + quOpen.repeat) + ". QUESTBOOK REPEAT DAILY|MONTHLY|YEARLY|NONE.", quRp ? "orange" : "cyan");
} else if (quCmd === "reward") {
  if (quNeedOpen()) {
    var quRm = /^(renown|xp|gold|item|clear)(?:\s+(.*))?$/i.exec(quRest);
    var quRw = quOpen.rewards;
    if (!quRest) QU.say(quOpen.name + " rewards " + (QU.rewardText(quOpen).join(", ") || "nothing written down") + ". QUESTBOOK REWARD RENOWN|XP|GOLD <n> | ITEM <text> | CLEAR.", "cyan");
    else if (!quRm) QU.say("QUESTBOOK REWARD RENOWN <n> | XP <n> | GOLD <n> | ITEM <text> | CLEAR.", "orange");
    else {
      var quRk = quRm[1].toLowerCase(), quRv = String(quRm[2] || "").trim();
      if (quRk === "clear") { quOpen.rewards = { renown: 0, gold: 0, items: [] }; QU.save(); QU.say(quOpen.name + ": rewards cleared.", "lime"); }
      else if (quRk === "item") {
        if (!quRv) QU.say("QUESTBOOK REWARD ITEM <text>.", "orange");
        else { quRw.items.push(quRv); QU.save(); QU.say(quOpen.name + " rewards " + QU.rewardText(quOpen).join(", ") + ".", "lime"); }
      } else {
        var quNum = Number(quRv.replace(/,/g, ""));
        if (!/^\d+$/.test(quRv.replace(/,/g, ""))) QU.say("QUESTBOOK REWARD " + quRk.toUpperCase() + " <number> (0 takes it off).", "orange");
        else { quRw[quRk] = quNum; QU.save(); QU.say(quOpen.name + " rewards " + (QU.rewardText(quOpen).join(", ") || "nothing written down") + ".", "lime"); }
      }
    }
  }
} else if (quCmd === "rename") {
  if (quNeedOpen()) {
    if (!quRest) QU.say("QUESTBOOK RENAME <new name> (the quest open in the tab).", "orange");
    else if (/^\d+$/.test(quRest)) QU.say("give it a name, not a number.", "orange");
    else if (QU.byName(quRest) && QU.byName(quRest) !== quOpen) QU.say(quRest + " is taken: pick another name.", "orange");
    else { var quOld = quOpen.name; quOpen.name = quRest; QU.save(); QU.say(quOld + " is now " + quOpen.name + ".", "lime"); }
  }
} else if (quCmd === "remove" || quCmd === "del") {
  var quRc = /^(.*?)(?:\s+(confirm))?$/i.exec(quRest);
  quQ = QU.find(quRc[1]);
  if (!quQ) QU.say("no quest '" + quRc[1] + "'. QUESTBOOK REMOVE <name|number> CONFIRM.", "orange");
  else if (!quRc[2]) QU.say("this forgets " + quQ.name + ": its " + quQ.steps.length + (quQ.steps.length === 1 ? " step" : " steps") + " and its record (done " + QU.times(QU.st(quQ).done) + "). QUESTBOOK REMOVE " + quQ.id + " CONFIRM to go ahead.", "orange");
  else {
    QU.list.splice(QU.list.indexOf(quQ), 1);
    delete QU.state[quQ.id];
    if (QU.open === quQ.id) QU.open = null;
    if (QU.follow === quQ.id) QU.follow = null;
    QU.save();
    QU.say("forgot " + quQ.name + ".", "lime");
  }
} else if (quCmd === "show") {
  var quSh = quRest.toLowerCase();
  if (quSh === "all" || quSh === "ready" || quSh === "waiting") { QU.setFilter(quSh); QU.say("the tab shows " + (quSh === "all" ? "every quest" : (quSh === "ready" ? "quests you can do now (and those under way)" : "quests waiting for their reset")) + ".", "lime"); }
  else if (!quSh) QU.say("the tab shows " + QU.filter + ". QUESTBOOK SHOW ALL|READY|WAITING.", "cyan");
  else QU.say("QUESTBOOK SHOW ALL|READY|WAITING.", "orange");
} else if (quCmd === "midnight") {
  var quDm = /^(\d{1,2}):(\d{2})$/.exec(quRest);
  if (!quRest) QU.say("the game's midnight, when monthly quests reset, is " + QU.midnight + " on your clock. QUESTBOOK MIDNIGHT <hh:mm> to change it.", "cyan");
  else if (!quDm || Number(quDm[1]) > 23 || Number(quDm[2]) > 59) QU.say("QUESTBOOK MIDNIGHT <hh:mm>, 00:00 to 23:59, on your own clock.", "orange");
  else {
    QU.midnight = (quDm[1].length < 2 ? "0" : "") + quDm[1] + ":" + quDm[2];
    if (QU.midnight === "02:00") delete_variable("questbook_midnight"); else set_variable("questbook_midnight", QU.midnight);
    if (QU.year) { delete_variable("questbook_year"); QU.year = 0; }
    run_function("questbook_render", [], "questbook");
    QU.say("the game's midnight is " + QU.midnight + " on your clock: monthly quests reset then. Type DATE once so yearly ones line up with it again.", "lime");
  }
} else if (quCmd === "reset") {
  run_function("questbook_setup", [], "questbook");
  run_function("questbook_render", [], "questbook");
  QU.say("reset: saved quests reloaded, tab redrawn.", "lime");
} else if (quCmd === "debug") {
  var quFd = QU.followed();
  QU.say("here=" + JSON.stringify(QU.here) + " open=" + QU.open + " follow=" + QU.follow + (quFd ? " step=" + JSON.stringify(QU.state[quFd.id] || {}) + " current=" + JSON.stringify(QU.current(quFd)) : "") +
    " inv=" + Object.keys(QU.inv).length + " quests=" + QU.list.length + " filter=" + QU.filter + " midnight=" + QU.midnight + " year=" + (QU.year ? new Date(QU.year).toString() : "unknown") + " nextYear=" + (QU.year ? new Date(QU.nextReset("yearly", Date.now())).toString() : "?"), "cyan");
} else {
  QU.say("unknown command '" + quCmd + "'. QUESTBOOK HELP for commands.", "orange");
}
