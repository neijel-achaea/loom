// Closes the open session: archives it, checks it for a record, prints the
// digest. Called by the tick after a long silence, and by COFFERS NEW.
run_function("gc_ensure", [], "coffers");
var F = client.gcF;
var S = client.gcSess;
if (S) {
  var dur = S.last - S.s;
  var net = S.inn - S.out;
  if (dur >= 60 || S.inn > 0 || S.out > 0) {
    client.gcSessions.push({ s: S.s, e: S.last, w0: S.w0, w1: S.w1, inn: S.inn, out: S.out, peak: S.peak, low: S.low, big: S.big });
    while (client.gcSessions.length > 50) { client.gcSessions.shift(); }
    var R = client.gcRec;
    var isRec = false;
    if (net > 0 && (!R.bestSess || net > R.bestSess.net)) { R.bestSess = { net: net, s: S.s, dur: dur }; isRec = true; }
    var line = "[coffers] session of " + F.date(S.s) + " " + F.hm(S.s) + " closed after " + F.dur(dur) + ": net " + F.s(net) + " gold (in " + F.n(S.inn) + ", out " + F.n(S.out) + ")";
    if (dur >= 600) { line += ", " + F.s(Math.round(net / (dur / 3600))) + "/hr"; }
    display_notice(line + ".", net >= 0 ? "gold" : "orange");
    if (isRec) { display_notice("[coffers] *** that was your most profitable session yet ***", "gold"); }
    try { set_variable("gc_sessions", JSON.stringify(client.gcSessions)); } catch (e) {}
    try { set_variable("gc_rec", JSON.stringify(client.gcRec)); } catch (e) {}
  }
  client.gcSess = null;
  try { set_variable("gc_sess", ""); } catch (e) {}
}