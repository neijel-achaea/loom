// Level and percent to the next level come from GMCP: Char.Vitals carries
// nl (a whole percent) on every prompt, and its charstats line
// "Level: 54 (23.45%)" the precise figure when present; Char.Status carries
// the level. A sample is taken on each Char.Vitals, so once per prompt,
// whatever the prompt looks like.
var lgM = "";
var lgA = null;
try { lgM = args.gmcp_method; lgA = args.gmcp_args; } catch (e) { lgM = ""; }
if ((lgM === "Char.Vitals" || lgM === "Char.Status") && lgA) {
  if (typeof lgA === "string") { try { lgA = JSON.parse(lgA); } catch (e) { lgA = null; } }
  if (lgA) {
    if (!client.loom || !client.loom.levelgraph || !client.loom.levelgraph.day) run_function("levelgraph_setup", [], "levelgraph");
    var LG = client.loom.levelgraph;
    if (lgM === "Char.Status" && lgA.level !== undefined) {
      var lgS = String(lgA.level).match(/(\d+)(?:\s*\(([\d.]+)%\))?/);
      if (lgS) {
        LG.level = parseInt(lgS[1], 10);
        if (lgS[2] !== undefined) LG.nl = parseFloat(lgS[2]);
      }
    }
    if (lgM === "Char.Vitals") {
      var lgP = null;
      if (lgA.charstats) {
        for (var lgI = 0; lgI < lgA.charstats.length; lgI++) {
          var lgC = String(lgA.charstats[lgI]).match(/Level:\s*(\d+)\s*\(([\d.]+)%\)/);
          if (lgC) { lgP = lgC; break; }
        }
      }
      if (lgP) {
        LG.level = parseInt(lgP[1], 10);
        LG.nl = parseFloat(lgP[2]);
      } else if (lgA.nl !== undefined) {
        // Whole percent only: keep a precise figure already held for it.
        var lgN = parseFloat(lgA.nl);
        if (!isNaN(lgN) && (LG.nl === undefined || Math.floor(LG.nl) !== lgN)) LG.nl = lgN;
      }
      run_function("levelgraph_sample", [], "levelgraph");
    }
  }
}
