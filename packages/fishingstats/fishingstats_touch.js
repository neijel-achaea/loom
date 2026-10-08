// Called before any catch or cast is booked. If the session has been idle
// longer than the gap threshold, the old one is archived and a fresh one
// started, so sessions delimit themselves without needing to be told.
if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
var s = FS.session;
var now = Math.floor(new Date().getTime() / 1000);
if (s.n > 0 && s.last && (now - s.last) > FS.gap * 60) {
  var mins = Math.round((now - s.last) / 60);
  run_function("fishingstats_archive", [], "fishingstats");
  display_notice("[fishingstats] " + mins + " minutes idle, so the previous session was filed to the log. Starting a new one.", "cyan");
}
FS.session.last = now;
var ar = FS.areaNow;
if (ar) { FS.session.areas[ar] = (FS.session.areas[ar] || 0) + 1; }
if (!FS.session.year && FS.rec.year) { FS.session.year = FS.rec.year; }