// Char.Status carries gold and bank: in full on login, then only the fields
// that changed. Just remember the latest values; the prompt tick does the
// accounting, by which time a deposit's gold and bank halves have both landed.
// This body is self-contained: if the package onGMCP never fires, paste it
// as-is into the global onGMCP.
var gcM = "";
var gcA = null;
try { gcM = args.gmcp_method; gcA = args.gmcp_args; } catch (e) { gcM = ""; }
if (gcM === "Char.Status" && gcA) {
  if (typeof gcA === "string") { try { gcA = JSON.parse(gcA); } catch (e) { gcA = null; } }
  if (gcA) {
    if (!client.gcLive) { client.gcLive = {}; }
    if (gcA.gold !== undefined) { var gcG = parseInt(String(gcA.gold).replace(/[^0-9\-]/g, ""), 10); if (!isNaN(gcG)) { client.gcLive.gold = gcG; } }
    if (gcA.bank !== undefined) { var gcB = parseInt(String(gcA.bank).replace(/[^0-9\-]/g, ""), 10); if (!isNaN(gcB)) { client.gcLive.bank = gcB; } }
    client.gcLive.at = Math.floor(new Date().getTime() / 1000);
  }
}