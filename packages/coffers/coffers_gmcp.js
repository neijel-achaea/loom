// coffers_gmcp -- the work behind onGMCP, as a function made once per load
// (client.loom.hooks.coffers.gmcp). Nexus compiles a script afresh every time it
// runs, and long ones cost on every GMCP message, so the script itself stays two
// lines and calls this (#136). Run from onLoad and onInstall, so a reimport
// replaces it.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.coffers) client.loom.hooks.coffers = {};
client.loom.hooks.coffers.gmcp = function (args) {
  // Char.Status carries gold and bank: in full on login, then only the fields
  // that changed. Just remember the latest values. Char.Vitals comes once per
  // prompt, whatever the prompt looks like, and does the accounting, but not
  // on the one right after a gold or bank change: waiting a prompt makes sure
  // a deposit's gold and bank halves have both landed, so it counts as neither
  // income nor spending.
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
      if (gcA.gold !== undefined || gcA.bank !== undefined) CO.moneyMoved = true;
    }
  }
  if (gcM === "Char.Vitals") {
    if (!client.loom || !client.loom.coffers || !client.loom.coffers.f) run_function("coffers_setup", [], "coffers");
    if (client.loom.coffers.moneyMoved) client.loom.coffers.moneyMoved = false;
    else { try { run_function("coffers_tick", [], "coffers"); } catch (e) {} }
  }
};
