// Current health from Char.Vitals: for "health lasts" in the exchange, and
// to count healing. Between two prompts, healing is the change in health
// plus the damage taken in between (so a heal and a hit on the same prompt
// both count); while a fight is on (up to the gap after its last blow) it
// is added to that fight.
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
      var dcF = DC.fight;
      var dcGain = (typeof DC.hp === "number") ? dcHp - DC.hp + (DC.incSince || 0) : 0;
      var dcHealed = false;
      if (dcF && dcGain > 0 && Date.now() - dcF.last <= DC.gap * 1000) { dcF.heal = (dcF.heal || 0) + dcGain; dcHealed = true; }
      DC.hp = dcHp;
      DC.incSince = 0;
      if (dcHealed && !DC.view) run_function("dmgchart_render", [], "dmgchart");
    }
  }
}
