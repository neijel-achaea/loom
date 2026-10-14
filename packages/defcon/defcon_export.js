// defcon_export -- DEFCON EXPORT: the current class's whole table, as it
// is with the player's changes, in the class-file format
// (packages/defcon/classes/<class>.js). Pasted into an issue, it can become
// the new default as it is; the player's changes are marked in comments.
var D = client.loom.defcon;
run_function("defcon_table", [], "defcon");
var T = D.tbl;
var dcQ = (s) => JSON.stringify(String(s));
var dcLines = [];
dcLines.push("// " + T.name + ": exported with DEFCON EXPORT (defcon " + ((client.loom.registry.defcon || {}).version || "?") + ").");
if (T.removed.length) dcLines.push("// Removed from the default: " + T.removed.join(", ") + ".");
var dcCustom = D.custom[T.name] || {};
var dcCmdRm = [].concat(((dcCustom.init || {}).remove) || [], ((dcCustom.aftermorph || {}).remove) || []);
if (dcCmdRm.length) dcLines.push("// Commands removed from the default: " + dcCmdRm.join("; ") + ".");
dcLines.push("D.classes[" + dcQ(T.name) + "] = {");
var dcList = (key, list, mine) => {
  if (!list.length && key !== "init") return;
  var out = [];
  for (var i = 0; i < list.length; i++) out.push(dcQ(list[i]));
  dcLines.push("  " + key + ": [" + out.join(", ") + "]," + (list.some((c) => mine.indexOf(c) >= 0) ? "  // has yours" : ""));
};
dcList("init", T.init, T.initMine);
dcList("aftermorph", T.aftermorph, T.afterMine);
dcLines.push("  defs: [");
for (var dcI = 0; dcI < T.defs.length; dcI++) {
  var dcD = T.defs[dcI];
  var dcRow = "    [" + dcQ(dcD[0]) + ", " + dcD[1] + ", " + dcD[2] + (dcD[3] ? ", " + (dcD[3] === true ? "true" : dcQ(dcD[3])) : "") + "]";
  dcRow += (dcI < T.defs.length - 1 ? "," : "");
  if (T.mine[dcD[0]]) dcRow += "  // " + T.mine[dcD[0]];
  dcLines.push(dcRow);
}
dcLines.push("  ]");
dcLines.push("};");

display_notice("[defcon] " + T.name + " table, ready to paste into an issue on github.com/neijel-achaea/loom:", "cyan");
var dcHtml = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
if (dcHtml) {
  var dcEsc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  nexusclient.add_html_line('<span style="font-family:\'Courier New\',monospace;white-space:pre;color:#9fc9c9">' + dcEsc(dcLines.join("\n")) + '</span>');
} else {
  for (var dcJ = 0; dcJ < dcLines.length; dcJ++) display_notice(dcLines[dcJ], "#9fc9c9");
}
