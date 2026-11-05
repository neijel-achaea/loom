// The commodities market's CM LIST (#473): read whether typed (shown) or
// sent by SCAN (hidden). args[0] is the line.
var SH = client.loom && client.loom.shopping;
if (SH && SH.mktLine) {
  var shMl = String(args[0] || "");
  if ((SH.m || /^Listing all /.test(shMl)) && SH.mktLine(shMl)) gag_current_line();
}
