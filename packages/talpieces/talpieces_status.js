// talpieces_status -- what bare TALPIECES prints.
if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
var tsTot = TP.totals();
var tsHave = tsTot[0] + tsTot[1];
var tsPct = Math.round((tsHave / TP.goalTotal) * 1000) / 10;
var tsMN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var tsSince = "no history yet";
if (TP.hist && TP.hist.length) {
  var tsD = new Date(TP.hist[0][0] * 1000);
  tsSince = TP.hist.length + " history point" + (TP.hist.length === 1 ? "" : "s") + " since " + tsD.getDate() + " " + tsMN[tsD.getMonth()] + " " + tsD.getFullYear();
}
display_notice("[talpieces] " + tsHave + " / " + TP.goalTotal + " pieces (" + tsPct + "%), "
  + tsTot[0] + " common + " + tsTot[1] + " rare; " + tsSince
  + "; graph " + (TP.graphOn ? "on" : "off") + " (" + TP.chartH + "px), combine " + (get_variable("talpieces_combine") === "off" ? "off" : "on")
  + ". TALPIECES HELP for commands.", "cyan");
// The goal or today's aim (#460), if there's one.
var tsT = TP.target ? TP.target() : null;
if (tsT) {
  var tsOf = tsT.to - tsT.base, tsGot = Math.max(0, Math.min(tsOf, tsHave - tsT.base));
  display_notice("[talpieces] " + (tsT.kind === "goal" ? "goal" : "today's aim") + ": " + tsGot + " of " + tsOf + " pieces" + (tsT.done || tsGot >= tsOf ? ", reached." : "."), tsT.done ? "lime" : "cyan");
}
