// The DIRECTORY table (header, rules, rows), hidden while our own lookup
// reads it. args[0] is the line.
var SH = client.loom && client.loom.shopping;
if (SH && SH.q && SH.q.sent && SH.line(String(args[0] || ""))) gag_current_line();
