// Closes the open session: archives it, checks it for a record, prints the
// digest. Called by the tick after a long silence, and by COFFERS NEW.
if (!client.loom || !client.loom.coffers || !client.loom.coffers.f) run_function("coffers_setup", [], "coffers");
var CO = client.loom.coffers;
var F = CO.f;
var S = CO.sess;
if (S) {
  var dur = S.last - S.s;
  var net = S.inn - S.out;
  if (dur >= 60 || S.inn > 0 || S.out > 0) {
    CO.sessions.push({ s: S.s, e: S.last, w0: S.w0, w1: S.w1, inn: S.inn, out: S.out, peak: S.peak, low: S.low, big: S.big });
    while (CO.sessions.length > 50) { CO.sessions.shift(); }
    var R = CO.rec;
    var isRec = false;
    if (net > 0 && (!R.bestSess || net > R.bestSess.net)) { R.bestSess = { net: net, s: S.s, dur: dur }; isRec = true; }
    var line = "[coffers] session of " + F.date(S.s) + " " + F.hm(S.s) + " closed after " + F.dur(dur) + ": net " + F.s(net) + " gold (in " + F.n(S.inn) + ", out " + F.n(S.out) + ")";
    if (dur >= 600) { line += ", " + F.s(Math.round(net / (dur / 3600))) + "/hr"; }
    display_notice(line + ".", net >= 0 ? "gold" : "orange");
    if (isRec) { display_notice("[coffers] *** that was your most profitable session yet ***", "gold"); }
    try { set_variable("coffers_sessions", JSON.stringify(CO.sessions)); } catch (e) {}
    try { set_variable("coffers_rec", JSON.stringify(CO.rec)); } catch (e) {}
  }
  CO.sess = null;
  try { set_variable("coffers_sess", ""); } catch (e) {}
}