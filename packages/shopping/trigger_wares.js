// A commodity shop's WARES table (#473), read as you see it (nothing hidden).
// args[0] is the line.
if (!client.loom || !client.loom.shopping || !client.loom.shopping.list) run_function("shopping_setup", [], "shopping");
var SH = client.loom.shopping, shWl = String(args[0] || "");
var shWp = /^Proprietor: (.+)\.$/.exec(shWl);
if (shWp) SH.waresStart(shWp[1]);
else if (SH.w) SH.waresLine(shWl);
