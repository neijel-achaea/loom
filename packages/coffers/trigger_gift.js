// "Grulk gives 5,000 gold sovereigns to you." -- gold given to you (#53),
// for loom's link coffers-standings. The balance itself comes from GMCP as
// before; this only notes who gave and how much.
if (!client.loom || !client.loom.coffers || !client.loom.coffers.gifts) run_function("coffers_setup", [], "coffers");
var CO = client.loom.coffers;
var cgAmt = parseInt(String(args[2]).replace(/,/g, ""), 10);
if (!isNaN(cgAmt) && cgAmt > 0) {
  CO.gifts.push({ who: String(args[1]), amount: cgAmt, t: Date.now() });
  if (CO.gifts.length > 30) CO.gifts.splice(0, CO.gifts.length - 30);
  if (client.loom.notify) client.loom.notify("coffers");
}
