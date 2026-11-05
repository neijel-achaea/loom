// "You are about to purchase 1 Coal commodities for a total of 55 gold
// sovereigns. Type AGREE …" (#473): agreed for our own BUY within its ceiling.
var SH = client.loom && client.loom.shopping;
if (SH && SH.mktAgree) SH.mktAgree(Number(String(args[1]).replace(/,/g, "")), args[2], Number(String(args[3]).replace(/,/g, "")));
