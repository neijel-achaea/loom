// Everything partycomms broadcasts comes from GMCP: Char.Status for your
// name and class, Char.Vitals for health, mana, endurance, willpower, rage
// (its charstats line) and level progress, IRE.Target.Info for your target.
// Each Char.Vitals is also the moment to broadcast.
var pcM = "";
var pcA = null;
try { pcM = args.gmcp_method; pcA = args.gmcp_args; } catch (e) { pcM = ""; }
if (typeof pcA === "string") { try { pcA = JSON.parse(pcA); } catch (e) { pcA = null; } }
if (pcA && (pcM === "Char.Vitals" || pcM === "Char.Status" || pcM === "Char.Name" || pcM === "IRE.Target.Info")) {
  if (!client.loom || !client.loom.partycomms || !client.loom.partycomms.members) run_function("partycomms_setup", [], "partycomms");
  var PC = client.loom.partycomms;
  var ME = PC.me;
  if (pcM === "Char.Status" || pcM === "Char.Name") {
    if (pcA.name && String(pcA.name) !== ME.name) { ME.name = String(pcA.name); set_variable("partycomms_name", ME.name); }
    if (pcA["class"] && String(pcA["class"]) !== ME.cls) { ME.cls = String(pcA["class"]); set_variable("partycomms_class", ME.cls); }
  } else if (pcM === "IRE.Target.Info") {
    // Later updates for the same target can carry only its health, so a name
    // already known for that id is kept.
    var pcTi = String(pcA.id || "");
    var pcTn = String(pcA.short_desc || "");
    if (!pcTn && pcTi && pcTi === PC.tInfo.id) pcTn = PC.tInfo.name;
    PC.tInfo = { id: pcTi, name: pcTn, hp: String(pcA.hpperc || "").replace("%", "") };
  } else {
    var pcF = ["hp", "maxhp", "mp", "maxmp", "ep", "maxep", "wp", "maxwp"];
    for (var pcI = 0; pcI < pcF.length; pcI++) {
      if (pcA[pcF[pcI]] !== undefined) { var pcN = parseInt(pcA[pcF[pcI]], 10); if (!isNaN(pcN)) ME[pcF[pcI]] = pcN; }
    }
    if (pcA.nl !== undefined) { var pcL = parseFloat(pcA.nl); if (!isNaN(pcL)) ME.nl = pcL; }
    if (pcA.charstats) {
      for (var pcJ = 0; pcJ < pcA.charstats.length; pcJ++) {
        var pcR = String(pcA.charstats[pcJ]).match(/^Rage:\s*(\d+)/);
        if (pcR) ME.rage = parseInt(pcR[1], 10);
        var pcP = String(pcA.charstats[pcJ]).match(/Level:\s*\d+\s*\(([\d.]+)%\)/);
        if (pcP) ME.nl = parseFloat(pcP[1]);
      }
    }
    run_function("partycomms_send", [], "partycomms");
  }
}
