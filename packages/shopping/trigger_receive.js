// "You pay 80 sovereigns and receive a group of 10 cohosh roots.": the
// item comes off the shopping list. args[1] is what was received.
var SH = client.loom && client.loom.shopping;
if (SH && SH.list && SH.list.length) SH.received(args[1]);
