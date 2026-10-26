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
  var quN = { going: 0, ready: 0, waiting: 0 };
  for (var quI = 0; quI < QU.list.length; quI++) quN[QU.status(QU.list[quI])]++;
  var quF = QU.followed();
  QU.say(QU.list.length + (QU.list.length === 1 ? " quest" : " quests") + ": " + quN.going + " under way, " + quN.ready + " ready, " + quN.waiting + " waiting. " +
    (quF ? "Following " + quF.name + " (step " + (QU.st(quF).step + 1) + " of " + quF.steps.length + "). " : "") + "Daily reset " + QU.daily + ". QUESTBOOK LIST, QUESTBOOK HELP.", "cyan");
} else if (quCmd === "help") {
  run_function("questbook_help", [], "questbook");
} else if (quCmd === "list") {
  if (!QU.list.length) QU.say("no quests yet: QUESTBOOK NEW <name> starts one.", "cyan");
  for (var quJ = 0; quJ < QU.list.length; quJ++) {
    var quL = QU.list[quJ], quS = QU.status(quL), quRa = QU.readyAt(quL);
    QU.say(quL.id + ". " + quL.name + " (" + (quL.area || "?") + ", " + quL.repeat + ", " + quL.steps.length + (quL.steps.length === 1 ? " step" : " steps") + "): " +
      (quS === "going" ? "step " + (QU.st(quL).step + 1) + " of " + quL.steps.length : (quS === "ready" ? "ready" : "again in " + QU.span(quRa - Date.now()).toLowerCase())), "cyan");
  }
} else if (quCmd === "new") {
  if (!quRest) QU.say("QUESTBOOK NEW <name>.", "orange");
  else if (/^\d+$/.test(quRest)) QU.say("give it a name, not a number: the number is the quest's.", "orange");
  else if (QU.byName(quRest)) QU.say(QU.byName(quRest).name + " is taken: pick another name.", "orange");
  else {
    quQ = { id: QU.nextId(), name: quRest, area: (QU.here && QU.here.area) || "", repeat: "daily", at: Date.now(), rewards: { renown: 0, gold: 0, items: [] }, steps: [] };
    QU.list.push(quQ);
    QU.save();
    QU.openQuest(quQ, true);
    QU.say("new quest " + quQ.name + " (" + quQ.id + (quQ.area ? ", " + quQ.area : "") + ", daily). Add its steps with QUESTBOOK STEP …: GO saves this room. Nothing ticks while you write it; START OVER in the tab follows it.", "lime");
  }
} else if (quCmd === "open") {
  quQ = QU.find(quRest);
  if (quQ) QU.openQuest(quQ);
  else QU.say("no quest '" + quRest + "'. QUESTBOOK OPEN <name|number>.", "orange");
} else if (quCmd === "close") {
  QU.openQuest(null);
} else if (quCmd === "step") {
  if (quNeedOpen()) {
    var quSs = quRest.search(/\s/);
    var quK = (quSs < 0 ? quRest : quRest.substring(0, quSs)).toLowerCase();
    var quT = quSs < 0 ? "" : quRest.substring(quSs).trim();
    var quKind = quK === "talk" || quK === "ask" || quK === "say";
    var quItem = quK === "get" || quK === "buy" || quK === "give";
    if (quK === "go") {
      if (!QU.here || !QU.here.id) QU.say("no room yet: move or LOOK first.", "orange");
      else QU.addStep(quOpen, { k: "go", room: QU.here.id, name: QU.here.name, area: QU.here.area });
    } else if (quKind) {
      if (!quT) QU.say("QUESTBOOK STEP " + quK.toUpperCase() + " <the command, as you'd type it>.", "orange");
      else QU.addStep(quOpen, { k: quK, cmd: quT });
    } else if (quItem) {
      var quP = quT.split(/\s+\/\s+/);
      if (!quP[0]) QU.say("QUESTBOOK STEP " + quK.toUpperCase() + " <item> [/ <command>].", "orange");
      else QU.addStep(quOpen, { k: quK, what: quP[0], cmd: quP.slice(1).join(" / ") });
    } else if (quK === "kill") {
      var quKm = /^(?:(\d+)\s+)?(.+)$/.exec(quT);
      if (!quKm) QU.say("QUESTBOOK STEP KILL [count] <mob>.", "orange");
      else QU.addStep(quOpen, { k: "kill", n: Number(quKm[1] || 1), what: quKm[2] });
    } else if (quK === "note") {
      if (!quT) QU.say("QUESTBOOK STEP NOTE <text>.", "orange");
      else QU.addStep(quOpen, { k: "note", text: quT });
    } else if (quK === "remove" || quK === "del") {
      var quNo = Number(quT);
      if (!/^\d+$/.test(quT) || quNo < 1 || quNo > quOpen.steps.length) QU.say("QUESTBOOK STEP REMOVE <1-" + quOpen.steps.length + ">.", "orange");
      else QU.removeStep(quOpen, quNo - 1);
    } else {
      QU.say("QUESTBOOK STEP GO | TALK|ASK|SAY <command> | GET|BUY|GIVE <item> [/ <command>] | KILL [count] <mob> | NOTE <text> | REMOVE <n>.", "orange");
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
  if (!quNeedOpen()) {}
  else if (quRp === "daily" || quRp === "yearly") { quOpen.repeat = quRp; QU.save(); QU.say(quOpen.name + " repeats " + quRp + (quRp === "yearly" ? " (an Achaean year: 300 hours after you last did it)" : " (at the daily reset, " + QU.daily + ")") + ".", "lime"); }
  else QU.say(quOpen.name + " repeats " + quOpen.repeat + ". QUESTBOOK REPEAT DAILY|YEARLY.", quRp ? "orange" : "cyan");
} else if (quCmd === "reward") {
  if (quNeedOpen()) {
    var quRm = /^(renown|gold|item|clear)(?:\s+(.*))?$/i.exec(quRest);
    var quRw = quOpen.rewards;
    if (!quRm) QU.say("QUESTBOOK REWARD RENOWN <n> | GOLD <n> | ITEM <text> | CLEAR.", "orange");
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
} else if (quCmd === "daily") {
  var quDm = /^(\d{1,2}):(\d{2})$/.exec(quRest);
  if (!quRest) QU.say("daily quests reset at " + QU.daily + " (your clock). QUESTBOOK DAILY <hh:mm> to change it.", "cyan");
  else if (!quDm || Number(quDm[1]) > 23 || Number(quDm[2]) > 59) QU.say("QUESTBOOK DAILY <hh:mm>, 00:00 to 23:59, on your own clock.", "orange");
  else {
    QU.daily = (quDm[1].length < 2 ? "0" : "") + quDm[1] + ":" + quDm[2];
    if (QU.daily === "00:00") delete_variable("questbook_daily"); else set_variable("questbook_daily", QU.daily);
    run_function("questbook_render", [], "questbook");
    QU.say("daily quests reset at " + QU.daily + " (your clock).", "lime");
  }
} else if (quCmd === "reset") {
  run_function("questbook_setup", [], "questbook");
  run_function("questbook_render", [], "questbook");
  QU.say("reset: saved quests reloaded, tab redrawn.", "lime");
} else if (quCmd === "debug") {
  var quFd = QU.followed();
  QU.say("here=" + JSON.stringify(QU.here) + " open=" + QU.open + " follow=" + QU.follow + (quFd ? " step=" + JSON.stringify(QU.state[quFd.id] || {}) + " current=" + JSON.stringify(QU.current(quFd)) : "") +
    " inv=" + Object.keys(QU.inv).length + " quests=" + QU.list.length + " filter=" + QU.filter + " daily=" + QU.daily + " lastReset=" + new Date(QU.lastReset(Date.now())).toString(), "cyan");
} else {
  QU.say("unknown command '" + quCmd + "'. QUESTBOOK HELP for commands.", "orange");
}
