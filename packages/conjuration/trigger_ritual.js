// The ritual's own lines, while one is under way: each step's reply moves it
// on; a bounce ("must regain balance", the say-like wait) has the step sent
// again once ready; balance recovered lets a waiting step go.
var CJ = client.loom && client.loom.conjuration;
var R = CJ && CJ.run;
if (R) {
  var cjLine = String(args[0] || "");
  var st = R.steps[R.i];
  var cjBounce = /^You must regain balance first\.|^You must wait a short while to use a say-like command again\./.test(cjLine);
  var cjBal = /^You have recovered balance on all limbs\./.test(cjLine);
  if (R.state === "expect" && st.expect && new RegExp(st.expect).test(cjLine)) {
    if (st.bal) { R.state = "bal"; R.sawLost = false; R.prompts = 0; }
    else run_function("conjuration_next", [], "conjuration");
  } else if (R.state === "expect" && cjBounce) {
    R.tries = (R.tries || 0) + 1;
    if (R.tries > 8) { CJ.failWhy = "it kept bouncing (" + cjLine + ")"; run_function("conjuration_fail", [], "conjuration"); }
    else { R.state = "retry"; R.sawLost = /balance/.test(cjLine); R.prompts = 0; }
  } else if (cjBal && (R.state === "bal" || R.state === "retry")) {
    if (R.state === "bal") run_function("conjuration_next", [], "conjuration");
    else { R.state = "send"; run_function("conjuration_step", [], "conjuration"); }
  }
}
