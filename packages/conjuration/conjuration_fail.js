// conjuration_fail -- stop the ritual under way, saying at which step and why
// (client.loom.conjuration.failWhy).
var CJ = client.loom.conjuration;
var R = CJ.run;
if (R) {
  var cjTook = false;
  for (var cjI = 0; cjI < R.i; cjI++) { if (/^outr /.test(R.steps[cjI].cmd)) cjTook = true; }
  if (/^outr /.test(R.steps[R.i].cmd)) cjTook = true;
  display_notice("[conjuration] " + R.sigil + " ritual stopped at step " + (R.i + 1) + " of " + R.steps.length + " (" + R.steps[R.i].cmd + "): " + (CJ.failWhy || "no reply") + "." + (cjTook ? " Reagents already taken out or put in may still be in your inventory or the ouroboros." : " Nothing was taken from the rift."), "orange");
}
CJ.run = null;
CJ.failWhy = "";
