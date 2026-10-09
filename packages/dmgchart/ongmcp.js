// Current health for "health lasts" in the exchange, from Char.Vitals.
var dcM = "";
var dcA = null;
try { dcM = args.gmcp_method; dcA = args.gmcp_args; } catch (e) { dcM = ""; }
if (dcM === "Char.Vitals" && dcA) {
  if (typeof dcA === "string") { try { dcA = JSON.parse(dcA); } catch (e) { dcA = null; } }
  if (dcA && dcA.hp !== undefined) {
    if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
    var dcHp = parseInt(dcA.hp, 10);
    if (!isNaN(dcHp)) client.loom.dmgchart.hp = dcHp;
  }
}
