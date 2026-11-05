// SHOPPING [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.shopping || !client.loom.shopping.list) run_function("shopping_setup", [], "shopping");
var SH = client.loom.shopping;
var shRaw = String(args[1] || "").trim();
var shSp = shRaw.search(/\s/);
var shCmd = (shSp < 0 ? shRaw : shRaw.substring(0, shSp)).toLowerCase();
var shRest = shSp < 0 ? "" : shRaw.substring(shSp).trim();
if (shCmd === "" || shCmd === "list") {
  if (!SH.list.length) SH.say("the list is empty. In a city, SHOPPING ADD [n] <item> looks it up in the directory.");
  else {
    var shG = SH.byShop(), shNum = 1;
    SH.say(SH.list.length + (SH.list.length === 1 ? " item" : " items") + " in " + shG.length + (shG.length === 1 ? " shop" : " shops") + ", about " + SH.sumText(SH.total()) + ":");
    for (var shI = 0; shI < shG.length; shI++) {
      SH.say(shG[shI].shop + (shG[shI].area ? " (" + shG[shI].area + ")" : "") + ": " + SH.sumText(shG[shI].sum));
      for (var shJ = 0; shJ < shG[shI].items.length; shJ++) {
        var shIt = shG[shI].items[shJ];
        SH.say("  " + (shNum++) + ". " + shIt.n + " × " + shIt.desc + " at " + SH.money(shIt.price, shIt.cur) + (shIt.n > 1 ? " = " + SH.money(shIt.n * shIt.price, shIt.cur) : ""));
      }
    }
  }
  if (SH.choices) SH.say("waiting for SHOPPING PICK <number> for " + SH.choices.word + ".");
} else if (shCmd === "help") {
  run_function("shopping_help", [], "shopping");
} else if (shCmd === "add") {
  var shM = /^(?:(\d+)\s+)?(.+)$/.exec(shRest);
  if (!shM) SH.say("SHOPPING ADD [n] <item>, e.g. SHOPPING ADD 5 tinderbox.", "orange");
  else {
    var shN = shM[1] ? Number(shM[1]) : 1;
    if (shN < 1 || shN > 9999) SH.say("how many: 1 to 9999.", "orange");
    else SH.add(shN, shM[2].trim());
  }
} else if (shCmd === "pick") {
  if (/^\d+$/.test(shRest)) SH.pick(Number(shRest));
  else if (SH.choices) { SH.say("SHOPPING PICK <number>: " + SH.choices.opts.map(function (o, i) { return (i + 1) + ". " + o.desc; }).join(", ") + ".", "orange"); }
  else SH.say("nothing to pick from: SHOPPING ADD [n] <item> first.", "orange");
} else if (shCmd === "remove" || shCmd === "del") {
  var shR = /^(.+?)(?:\s+(\d+))?$/.exec(shRest);
  // "REMOVE 3" is item 3; "REMOVE 3 2" two of item 3; "REMOVE tinderbox 2" two tinderboxes.
  var shWhat = shR ? shR[1] : "", shCount = shR && shR[2] ? Number(shR[2]) : 0;
  var shF = shWhat ? SH.find(shWhat) : null;
  if (!shF && shCount) { shF = SH.find(shRest); shCount = 0; }
  if (!shWhat) SH.say("SHOPPING REMOVE <number|item> [how many].", "orange");
  else if (!shF) SH.say("no item '" + shWhat + "' on the list. SHOPPING lists them, numbered.", "orange");
  else if (Array.isArray(shF)) SH.say("'" + shWhat + "' matches " + shF.map(function (x) { return x.desc; }).join(", ") + ": use its number from SHOPPING.", "orange");
  else SH.remove(shF, shCount);
} else if (shCmd === "buy") {
  var shB = shRest ? SH.find(shRest) : null;
  if (!shRest) SH.say("SHOPPING BUY <number|item>, or BUY on its line in the tab.", "orange");
  else if (!shB) SH.say("no item '" + shRest + "' on the list. SHOPPING lists them, numbered.", "orange");
  else if (Array.isArray(shB)) SH.say("'" + shRest + "' matches " + shB.map(function (x) { return x.desc; }).join(", ") + ": use its number from SHOPPING.", "orange");
  else SH.buy(shB);
} else if (shCmd === "walk") {
  // A shop by its name (any case, or the start of it) or its place in SHOPPING's list.
  var shShops = SH.byShop().map(function (x) { return x.shop; }), shTo = "";
  if (/^\d+$/.test(shRest)) shTo = shShops[Number(shRest) - 1] || "";
  else if (shRest) { var shQ = SH.key(shRest); shTo = shShops.filter(function (x) { return SH.key(x) === shQ; })[0] || shShops.filter(function (x) { return SH.key(x).indexOf(shQ) === 0; })[0] || ""; }
  if (!shRest) SH.say("SHOPPING WALK <shop|number>, or WALK on a shop's line in the tab.", "orange");
  else if (!shTo) SH.say("no shop '" + shRest + "' on the list.", "orange");
  else SH.walk(shTo);
} else if (shCmd === "skip" || shCmd === "unskip") {
  var shPool = shCmd === "skip" ? SH.byShop().map(function (x) { return x.shop; }) : SH.skipList(), shSk2 = "";
  if (/^\d+$/.test(shRest) && shCmd === "skip") shSk2 = shPool[Number(shRest) - 1] || "";
  else if (shRest) { var shSq = SH.key(shRest); shSk2 = shPool.filter(function (x) { return SH.key(x) === shSq; })[0] || shPool.filter(function (x) { return SH.key(x).indexOf(shSq) === 0; })[0] || ""; }
  if (shCmd === "unskip" && shRest.toLowerCase() === "all") SH.unskip("all");
  else if (!shRest) SH.say(SH.skipList().length ? "skipped: " + SH.skipList().join(", ") + ". SHOPPING UNSKIP <shop>|ALL." : "no shops skipped. SHOPPING SKIP <shop|number> moves a shop's items elsewhere.");
  else if (!shSk2) SH.say("no " + (shCmd === "skip" ? "shop" : "skipped shop") + " '" + shRest + "'.", "orange");
  else if (shCmd === "skip") SH.skipShop(shSk2);
  else SH.unskip(shSk2);
} else if (shCmd === "here") {
  var shHs = SH.byShop().map(function (x) { return x.shop; }), shHt = "";
  if (/^\d+$/.test(shRest)) shHt = shHs[Number(shRest) - 1] || "";
  else if (shRest) { var shHq = SH.key(shRest); shHt = shHs.filter(function (x) { return SH.key(x) === shHq; })[0] || shHs.filter(function (x) { return SH.key(x).indexOf(shHq) === 0; })[0] || ""; }
  if (!shRest) { var shIn = SH.shopHere(); SH.say(shIn ? "you're in " + shIn + "." : "this room isn't a shop on the list. SHOPPING HERE <shop|number> if it is."); }
  else if (!shHt) SH.say("no shop '" + shRest + "' on the list.", "orange");
  else SH.setHere(shHt);
} else if (shCmd === "min") {
  // Bare: read the rift, then every minimum and what's short. With an item:
  // its minimum; with a number or OFF, set or clear it (#440).
  var shMm = /^(.+?)\s+(\d[\d,]*|off)$/i.exec(shRest);
  if (!shRest) { SH.say("reading your rift…"); SH.readRift("min"); }
  else if (shMm) {
    var shMv = shMm[2].toLowerCase() === "off" ? null : Number(shMm[2].replace(/,/g, ""));
    if (shMv !== null && (shMv < 1 || shMv > 999999)) SH.say("a minimum is 1 to 999,999 (or OFF).", "orange");
    else SH.setMin(shMm[1], shMv);
  } else {
    var shMk = SH.key(shRest), shMo = SH.owner(shMk), shMh = SH.have(shMk);
    var shMt = shMh === null ? "" : " (" + SH.n(shMh) + " in your rift)";
    var shMw = shMo && shMo.by ? " " + shMo.by + " keeps " + (shMo.min != null ? SH.n(shMo.min) : "?") + " for itself" + (SH.watch[SH.key(SH.catOf(shMk))] ? ", used here while you set none (" + SH.catOf(shMk) + " watched)." : "; WATCH " + (SH.catOf(shMk) || "its category") + " ON to use it here.") : "";
    if (SH.mins[shMk] !== undefined) SH.say(shMk + ": minimum " + SH.n(SH.mins[shMk]) + shMt + ". SHOPPING MIN " + shMk + " OFF to clear it." + shMw);
    else SH.say("no minimum for " + shMk + shMt + ". SHOPPING MIN " + shMk + " <n> sets one." + shMw);
  }
} else if (shCmd === "watch") {
  var shWm = /^(.+?)\s+(on|off)$/i.exec(shRest);
  if (!shRest) SH.showWatch();
  else if (!shWm) SH.say("SHOPPING WATCH <category> ON|OFF, e.g. SHOPPING WATCH herbs ON.", "orange");
  else SH.setWatch(shWm[1], shWm[2].toLowerCase() === "on");
} else if (shCmd === "restock") {
  SH.say("reading your rift…");
  SH.readRift("restock");
} else if (shCmd === "goal") {
  SH.goal();
} else if (shCmd === "clear") {
  if (shRest.toLowerCase() === "confirm") SH.clear();
  else SH.say("SHOPPING CLEAR CONFIRM wipes the whole list (" + SH.list.length + (SH.list.length === 1 ? " item" : " items") + ").", "orange");
} else if (shCmd === "reset") {
  SH.q = null; SH.r = null; SH.queue = [];
  run_function("shopping_setup", [], "shopping");
  run_function("shopping_render", [], "shopping");
  SH.say("reset: the list reloaded, the tab redrawn.", "lime");
} else if (shCmd === "debug") {
  SH.say("here=" + JSON.stringify(SH.here) + " items=" + SH.list.length + " lookup=" + (SH.q ? JSON.stringify({ word: SH.q.word, sent: SH.q.sent, prompts: SH.q.prompts, head: SH.q.head, rules: SH.q.rules, rows: SH.q.rows.length, descAt: SH.q.descAt, shopAt: SH.q.shopAt }) : "none") +
    " choices=" + (SH.choices ? SH.choices.opts.length : 0) + " waitingOn=" + (SH.othersBusy() || "none") +
    " rift=" + Object.keys(SH.rift).length + " items read " + (SH.riftAt ? Math.round((Date.now() - SH.riftAt) / 60000) + "m ago" : "never") +
    " reading=" + (SH.r ? JSON.stringify({ then: SH.r.then, sent: SH.r.sent, head: SH.r.head, rules: SH.r.rules, pages: SH.r.pages, more: SH.r.more, cat: SH.r.cat, rows: Object.keys(SH.r.rows).length }) : "none") +
    " mins=" + Object.keys(SH.mins).length + " watch=" + Object.keys(SH.watch).join("/") + " queue=" + SH.queue.length + " picks=" + Object.keys(SH.picks).length);
} else {
  SH.say("unknown command '" + shCmd + "'. SHOPPING HELP for commands.", "orange");
}
