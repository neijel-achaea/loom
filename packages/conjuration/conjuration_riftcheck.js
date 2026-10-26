// conjuration_riftcheck -- the rift has been read (IR COMMODITIES, into
// run.have): go on if it holds every reagent, else stop before anything is
// taken out.
var CJ = client.loom.conjuration;
var R = CJ.run;
if (R && R.state === "rift") {
  var cjWhy = CJ.riftShort(R.reagents, R.have);
  if (cjWhy) { CJ.failWhy = cjWhy; run_function("conjuration_fail", [], "conjuration"); }
  else run_function("conjuration_next", [], "conjuration");
}
