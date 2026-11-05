// The whole rift (IR, every category, each page after MORE), hidden while
// our own reading is out (#440). args[0] is the line.
var SH = client.loom && client.loom.shopping;
if (SH && SH.r && SH.r.sent && SH.riftLine(String(args[0] || ""))) gag_current_line();
