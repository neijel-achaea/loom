// Our own IR ELIXIR / IR SALVE: header, category line, rules and rows,
// hidden while a run reads them. args[0] is the line.
var RM = client.loom && client.loom.remedies;
if (RM && RM.reading) {
  var rmL = String(args[0] || "");
  if (/^-{20,}$/.test(rmL)) { gag_current_line(); RM.rule(); }
  else if (/^\s*\[\s*[\d,]+\]\s/.test(rmL)) { if (RM.row(rmL)) gag_current_line(); }
  else if (/^(?:Glancing into your rift, you see:|Elixirs|Salves)$/.test(rmL)) gag_current_line();
}
