// conjuration_step -- sends the ritual under way (client.loom.conjuration.run)
// one step at a time. Steps that need nothing back (outr, put) go straight
// on; a step with an expected reply waits for it (trigger_ritual), and one
// that takes balance then waits for balance to come back (onGMCP), so the
// server's queue only ever holds one ritual command. Nothing is sent while
// triggers are paused; the ritual picks up again when they aren't.
//
// run.state: "send" (send step i now), "expect" (sent, waiting for its line),
// "bal" (confirmed, waiting for balance), "retry" (bounced, resend step i
// once ready), "held" (paused).
var CJ = client.loom.conjuration;
var R = CJ.run;
while (R && (R.state === "send" || R.state === "held")) {
  if (get_variable("pauseTriggers") === "on") { R.state = "held"; break; }
  var st = R.steps[R.i];
  send_command(st.cmd);
  R.prompts = 0;
  if (st.expect) { R.state = "expect"; break; }
  R.i++;
  R.state = "send";
}
