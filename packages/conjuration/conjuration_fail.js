// conjuration_fail -- stop the ritual under way, saying at which step and why
// (client.loom.conjuration.failWhy).
var CJ = client.loom.conjuration;
var R = CJ.run;
if (R) {
  display_notice("[conjuration] " + R.sigil + " ritual stopped at step " + (R.i + 1) + " of " + R.steps.length + " (" + R.steps[R.i].cmd + "): " + (CJ.failWhy || "no reply") + ". Reagents already put in may still be in the ouroboros.", "orange");
}
CJ.run = null;
CJ.failWhy = "";
