// Keeps client.loom.self in step with GMCP. Afflictions and defences arrive as a
// full List (on login, DIAGNOSE, DEF) and then as single Add / Remove updates;
// the package keeps the running set. Self-contained, so it can be pasted into
// the global onGMCP as-is if the package one never fires.
var sfM = "";
var sfA = null;
try { sfM = args.gmcp_method; sfA = args.gmcp_args; } catch (e) { sfM = ""; }
if (typeof sfA === "string") { try { sfA = JSON.parse(sfA); } catch (e) { sfA = null; } }
if (sfM && sfA !== null && sfA !== undefined) {
  if (!client.loom || !client.loom.self || !client.loom.self.keep) run_function("self_setup", [], "self");
  var S = client.loom.self;
  var sfNow = Math.floor(new Date().getTime() / 1000);
  var sfDirty = false;
  var sfI;
  if (sfM === "Char.Afflictions.List") {
    S.affs = {};
    for (sfI = 0; sfI < sfA.length; sfI++) { S.affs[sfA[sfI].name] = { cure: sfA[sfI].cure || "", desc: sfA[sfI].desc || "", t: sfNow }; }
    S.seenAffs = true;
    S.needDiag = false;
    sfDirty = true;
  } else if (sfM === "Char.Afflictions.Add") {
    S.affs[sfA.name] = { cure: sfA.cure || "", desc: sfA.desc || "", t: sfNow };
    S.seenAffs = true;
    sfDirty = true;
  } else if (sfM === "Char.Afflictions.Remove") {
    for (sfI = 0; sfI < sfA.length; sfI++) { delete S.affs[sfA[sfI]]; }
    sfDirty = true;
  } else if (sfM === "Char.Defences.List") {
    S.defs = {};
    for (sfI = 0; sfI < sfA.length; sfI++) { S.defs[sfA[sfI].name] = { desc: sfA[sfI].desc || "", t: sfNow }; delete S.lost[sfA[sfI].name]; }
    S.seenDefs = true;
    sfDirty = true;
  } else if (sfM === "Char.Defences.Add") {
    S.defs[sfA.name] = { desc: sfA.desc || "", t: sfNow };
    delete S.lost[sfA.name];
    S.seenDefs = true;
    sfDirty = true;
  } else if (sfM === "Char.Defences.Remove") {
    for (sfI = 0; sfI < sfA.length; sfI++) {
      if (S.defs[sfA[sfI]]) {
        S.lost[sfA[sfI]] = sfNow;
        // A defence you asked to watch: say so out loud, not just in the tab.
        if (S.want && S.want[sfA[sfI]]) { display_notice("[self] lost " + sfA[sfI] + "!", "orange"); }
      }
      delete S.defs[sfA[sfI]];
    }
    sfDirty = true;
  } else if (sfM === "Char.Vitals" && sfA.charstats) {
    // Vitals arrive with every prompt; redraw only when the stats change.
    var sfKey = sfA.charstats.join("|");
    if (sfKey !== S.statsKey) { S.statsKey = sfKey; S.stats = sfA.charstats.slice(0); sfDirty = true; }
  } else if (sfM === "Char.Status") {
    var sfF = ["name", "fullname", "level", "class", "race", "city", "house", "specialisation", "age", "xprank", "explorerrank"];
    for (sfI = 0; sfI < sfF.length; sfI++) { if (sfA[sfF[sfI]] !== undefined && sfA[sfF[sfI]] !== S.info[sfF[sfI]]) { S.info[sfF[sfI]] = sfA[sfF[sfI]]; sfDirty = true; } }
  } else if (sfM === "Char.Name") {
    if (sfA.name) { S.info.name = sfA.name; }
    if (sfA.fullname) { S.info.fullname = sfA.fullname; }
    sfDirty = true;
  }
  // A class change (dragonform included) brings that class's watched list.
  if (sfM === "Char.Status" && String(S.info["class"] || "any").toLowerCase().replace(/[^a-z0-9]+/g, "_") !== S.wantCls) run_function("self_setup", [], "self");
  // An override that only repeats the game's name (as the old SETNAME usually
  // did) is dropped, so self_name exists only when it changes something.
  if ((sfM === "Char.Name" || sfM === "Char.Status") && S.nameOverride && S.info.name && S.nameOverride.toLowerCase() === String(S.info.name).toLowerCase()) {
    S.nameOverride = "";
    try { delete_variable("self_name"); } catch (e) {}
  }
  if (sfDirty) { try { run_function("self_render", [], "self"); } catch (e) {} }
}