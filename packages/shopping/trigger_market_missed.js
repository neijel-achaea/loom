// "No Coal is being sold in that price range." (#473)
var SH = client.loom && client.loom.shopping;
if (SH && SH.lastBuy && SH.lastBuy.it && SH.lastBuy.it.shop === SH.MKT) SH.mktMissed(args[1]);
