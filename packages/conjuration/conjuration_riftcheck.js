// conjuration_riftcheck -- a part of the rift has been read into run.have
// (IR COMMODITIES, then IR PLANTS when the actions use kola). After the
// last part: go on if the rift holds everything, else stop before anything
// is taken out.
var CJ = client.loom.conjuration;
var R = CJ.run;
if (R && R.state === "rift") {
  if (!R.steps[R.i].riftLast) { run_function("conjuration_next", [], "conjuration"); }
  else {
    var cjWhy = CJ.riftShort(R.reagents, R.have);
    if (cjWhy) { CJ.failWhy = cjWhy; run_function("conjuration_fail", [], "conjuration"); }
    else run_function("conjuration_next", [], "conjuration");
  }
}
