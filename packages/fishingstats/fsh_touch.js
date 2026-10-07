// Called before any catch or cast is booked. If the session has been idle
// longer than the gap threshold, the old one is archived and a fresh one
// started, so sessions delimit themselves without needing to be told.
run_function("fsh_ensure", [], "fishingstats");
var s = client.fsh;
var now = Math.floor(new Date().getTime() / 1000);
if (s.n > 0 && s.last && (now - s.last) > client.fshGap * 60) {
  var mins = Math.round((now - s.last) / 60);
  run_function("fsh_archive", [], "fishingstats");
  display_notice("[fishing] " + mins + " minutes idle, so the previous session was filed to the log. Starting a new one.", "cyan");
}
client.fsh.last = now;
var ar = client.fshAreaNow;
if (ar) { client.fsh.areas[ar] = (client.fsh.areas[ar] || 0) + 1; }
if (!client.fsh.year && client.fshRec.year) { client.fsh.year = client.fshRec.year; }