// dmgchart_gmcp -- the work behind onGMCP, as a function made once per load
// (client.loom.hooks.dmgchart.gmcp). Nexus compiles a script afresh every time it
// runs, and long ones cost on every GMCP message, so the script itself stays two
// lines and calls this (#136). Run from onLoad and onInstall, so a reimport
// replaces it.
if (!client.loom) client.loom = {};
if (!client.loom.hooks) client.loom.hooks = {};
if (!client.loom.hooks.dmgchart) client.loom.hooks.dmgchart = {};
client.loom.hooks.dmgchart.gmcp = function (args) {
  // Current health from Char.Vitals, logged with its time for "health lasts" in
  // the exchange: how fast health is really falling, whatever hit or healed it.
  // While a fight is on (up to the gap after its last blow) every reading
  // works health lasts out again (and the WARN notice, #93) and redraws the
  // tab, so the figure follows sips and regeneration too.
  var dcM = "";
  var dcA = null;
  try { dcM = args.gmcp_method; dcA = args.gmcp_args; } catch (e) { dcM = ""; }
  if (dcM === "Char.Vitals" && dcA) {
    if (typeof dcA === "string") { try { dcA = JSON.parse(dcA); } catch (e) { dcA = null; } }
    if (dcA && dcA.hp !== undefined) {
      if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
      var DC = client.loom.dmgchart;
      var dcHp = parseInt(dcA.hp, 10);
      if (!isNaN(dcHp)) {
        var dcNow = Date.now();
        var dcChanged = dcHp !== DC.hp;
        DC.hp = dcHp;
        if (dcChanged || !DC.recent || !DC.recent.length) run_function("dmgchart_recent", { t: dcNow, hp: dcHp }, "dmgchart");
        if (DC.fight && dcNow - DC.fight.last <= DC.gap * 1000) {
          run_function("dmgchart_lasts", [], "dmgchart");
          if (!DC.view) { if (DC.drawSoon) DC.drawSoon(); else run_function("dmgchart_render", [], "dmgchart"); }
        }
      }
    }
  }
};
