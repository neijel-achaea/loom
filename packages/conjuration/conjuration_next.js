// conjuration_next -- the current step is done: move to the next one and
// send it, or finish the ritual after the last.
var CJ = client.loom.conjuration;
var R = CJ.run;
if (R) {
  R.i++;
  R.tries = 0;
  if (R.i >= R.steps.length) {
    display_notice("[conjuration] " + R.sigil + " sigil made.", "cyan");
    CJ.run = null;
  } else {
    R.state = "send";
    run_function("conjuration_step", [], "conjuration");
  }
}
