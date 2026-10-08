// Char.Status carries gold and bank: in full on login, then only the fields
// that changed. Just remember the latest values; the prompt tick does the
// accounting, by which time a deposit's gold and bank halves have both landed.
var gcM = "";
var gcA = null;
try { gcM = args.gmcp_method; gcA = args.gmcp_args; } catch (e) { gcM = ""; }
if (gcM === "Char.Status" && gcA) {
  if (typeof gcA === "string") { try { gcA = JSON.parse(gcA); } catch (e) { gcA = null; } }
  if (gcA) {
    if (!client.loom || !client.loom.coffers || !client.loom.coffers.f) run_function("coffers_setup", [], "coffers");
    var CO = client.loom.coffers;
    if (!CO.live) { CO.live = {}; }
    if (gcA.gold !== undefined) { var gcG = parseInt(String(gcA.gold).replace(/[^0-9\-]/g, ""), 10); if (!isNaN(gcG)) { CO.live.gold = gcG; } }
    if (gcA.bank !== undefined) { var gcB = parseInt(String(gcA.bank).replace(/[^0-9\-]/g, ""), 10); if (!isNaN(gcB)) { CO.live.bank = gcB; } }
    CO.live.at = Math.floor(new Date().getTime() / 1000);
  }
}