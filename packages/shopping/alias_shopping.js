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
} else if (shCmd === "clear") {
  if (shRest.toLowerCase() === "confirm") SH.clear();
  else SH.say("SHOPPING CLEAR CONFIRM wipes the whole list (" + SH.list.length + (SH.list.length === 1 ? " item" : " items") + ").", "orange");
} else if (shCmd === "reset") {
  SH.q = null;
  run_function("shopping_setup", [], "shopping");
  run_function("shopping_render", [], "shopping");
  SH.say("reset: the list reloaded, the tab redrawn.", "lime");
} else if (shCmd === "debug") {
  SH.say("here=" + JSON.stringify(SH.here) + " items=" + SH.list.length + " lookup=" + (SH.q ? JSON.stringify({ word: SH.q.word, sent: SH.q.sent, prompts: SH.q.prompts, head: SH.q.head, rules: SH.q.rules, rows: SH.q.rows.length, descAt: SH.q.descAt, shopAt: SH.q.shopAt }) : "none") +
    " choices=" + (SH.choices ? SH.choices.opts.length : 0) + " waitingOn=" + (SH.othersBusy() || "none"));
} else {
  SH.say("unknown command '" + shCmd + "'. SHOPPING HELP for commands.", "orange");
}
