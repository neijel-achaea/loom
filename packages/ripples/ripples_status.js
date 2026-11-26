// ripples_status -- the bare RIPPLES: the run under way, or the last one.
if (!client.loom || !client.loom.ripples || !client.loom.ripples.line) run_function("ripples_setup", [], "ripples");
var R = client.loom.ripples;
if (R.run) {
  var rsC = R.cur();
  var rsL = R.run.ripples.length ? R.run.ripples[R.run.ripples.length - 1] : null;
  R.say("wading for " + R.dur(Date.now() - R.run.t0) + ": " + (rsC ? "ripple " + rsC.n + " (" + R.place(rsC) + ")" + (rsC.wave !== null ? ", wave " + rsC.wave + "%" : "") : (rsL ? "ripple " + rsL.n + " cleared, choosing a boon" : "choosing your first boon")) + ", lives " + (R.run.lives === null ? "?" : R.run.lives) + ", renown " + R.n(R.run.renown) + ".", "cyan");
  if (rsC && rsC.aff.length) R.say("affixes: " + rsC.aff.join(", ") + ".", "cyan");
} else if (R.runs.length) {
  var rsR = R.runs[R.runs.length - 1], rsB = R.best();
  R.say("not wading. Last run: ripple " + R.depthOf(rsR) + " in " + R.dur(rsR.t1 - rsR.t0) + " (" + (rsR.end || "?") + "). Deepest: ripple " + rsB.d + ". " + R.runs.length + " runs kept.", "cyan");
} else {
  R.say("not wading, and no runs yet. Wade the Mnemosyne and the Ripples tab fills itself.", "cyan");
}
R.say("WADE STATUS is asked " + (R.poll ? "every " + R.poll + "s in a ripple (RIPPLES POLL)" : "never: POLL is OFF") + ". RIPPLES HELP for commands.", "cyan");
