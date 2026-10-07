// COFFERS <sub> <p1> <p2>. The alias stores the words in client.gcArgs,
// since run_function cannot pass parameters.
run_function("gc_ensure", [], "coffers");
var F = client.gcF;
var A = client.gcArgs || [];
var c = A[0] || "";
var p1 = A[1] || "";
var p2 = A[2] || "";
var now = Math.floor(new Date().getTime() / 1000);

function say(t, col) { display_notice("[coffers] " + t, col || "gold"); }
function plain(t) { display_notice(t, "white"); }
function save(name, val) { try { set_variable(name, val); } catch (e) {} }
function amt(s) {
  var m = /^(\d+(?:\.\d+)?)([km]?)$/.exec(s);
  if (!m) { return -1; }
  var v = parseFloat(m[1]);
  if (m[2] === "k") { v *= 1000; }
  if (m[2] === "m") { v *= 1000000; }
  return Math.round(v);
}
function lpad(s, n) { s = String(s); while (s.length < n) { s = " " + s; } return s; }
function rpad(s, n) { s = String(s); while (s.length < n) { s = s + " "; } return s; }
function render() { run_function("gc_render", [], "coffers"); }
function curWealth() {
  var L = client.gcLive || {};
  if (L.gold !== undefined && L.bank !== undefined) { return [L.gold, L.bank]; }
  var m = client.gcMin;
  if (m.length > 0) { return [m[m.length - 1][1], m[m.length - 1][2]]; }
  return null;
}
function sessLine(o, open) {
  var dur = Math.max(0, o.e - o.s);
  var net = o.inn - o.out;
  var ph = dur >= 600 ? F.s(Math.round(net / (dur / 3600))) : "-";
  return rpad(F.date(o.s), 7) + rpad(F.hm(o.s), 6) + lpad(F.dur(dur), 8) + lpad(F.s(net), 11) + lpad(F.n(o.inn), 10) + lpad(F.n(o.out), 10) + lpad(ph, 10) + (open ? "  (open)" : "");
}
function csvTime(t) {
  var d = new Date(t * 1000);
  var mm = d.getMonth() + 1, dd = d.getDate(), hh = d.getHours(), mi = d.getMinutes();
  return d.getFullYear() + "-" + (mm < 10 ? "0" : "") + mm + "-" + (dd < 10 ? "0" : "") + dd + " " + (hh < 10 ? "0" : "") + hh + ":" + (mi < 10 ? "0" : "") + mi;
}

if (c === "" || c === "status") {
  var cw = curWealth();
  if (!cw) { say("no reading of your purse yet. COFFERS DEBUG shows what has arrived.", "orange"); }
  else {
    var W = cw[0] + cw[1];
    var T = client.gcTiers;
    var ti = F.tier(W);
    say("fortune " + F.n(W) + " gold: " + F.n(cw[0]) + " in the purse, " + F.n(cw[1]) + " in the bank. Rank: " + T[ti][1] + ".");
    if (ti < T.length - 1) { say("next rank, " + T[ti + 1][1] + ", at " + F.n(T[ti + 1][0]) + ": " + F.n(T[ti + 1][0] - W) + " to go."); }
    if (client.gcGoal > 0 && client.gcGoalBase >= 0) {
      var ge = W - client.gcGoalBase;
      say("goal " + F.s(client.gcGoal) + " since " + F.date(client.gcGoalT) + ": earned " + F.s(ge) + (ge >= client.gcGoal ? ", reached!" : " (" + Math.max(0, Math.floor(ge / client.gcGoal * 100)) + "%), " + F.n(client.gcGoal - ge) + " to go."));
    }
    var S = client.gcSess;
    if (S) {
      var sd = Math.max(0, S.last - S.s);
      var sn = S.inn - S.out;
      say("session since " + F.hm(S.s) + " (" + F.dur(sd) + "): net " + F.s(sn) + ", in " + F.n(S.inn) + ", out " + F.n(S.out) + (sd >= 600 ? ", " + F.s(Math.round(sn / (sd / 3600))) + "/hr" : "") + ".");
    }
    var D = client.gcDays;
    var td = (D.length > 0 && F.dayKey(D[D.length - 1][0]) === F.dayKey(now)) ? D[D.length - 1] : null;
    if (td) { say("today: net " + F.s((td[3] || 0) - (td[4] || 0)) + ", in " + F.n(td[3] || 0) + ", out " + F.n(td[4] || 0) + "."); }
    var R = client.gcRec;
    var rl = [];
    if (R.peak) { rl.push("peak " + F.n(R.peak.w) + " (" + F.date(R.peak.t) + ")"); }
    if (R.bestDay) { rl.push("best day " + F.s(R.bestDay.net) + " (" + F.date(R.bestDay.t) + ")"); }
    if (R.bestSess) { rl.push("best session " + F.s(R.bestSess.net) + " (" + F.date(R.bestSess.s) + ", " + F.dur(R.bestSess.dur) + ")"); }
    if (rl.length > 0) { say("records: " + rl.join(", ") + "."); }
  }
}
else if (c === "sessions") {
  var ns = Math.max(1, Math.min(50, parseInt(p1, 10) || 10));
  var list = client.gcSessions.slice(-ns);
  say("last " + list.length + " closed session(s)" + (client.gcSess ? ", plus the open one" : "") + ":");
  plain(rpad("date", 7) + rpad("start", 6) + lpad("length", 8) + lpad("net", 11) + lpad("in", 10) + lpad("out", 10) + lpad("per hr", 10));
  for (var si = 0; si < list.length; si++) { plain(sessLine(list[si], false)); }
  if (client.gcSess) { var o = client.gcSess; plain(sessLine({ s: o.s, e: o.last, inn: o.inn, out: o.out }, true)); }
}
else if (c === "days") {
  var nd = Math.max(1, Math.min(365, parseInt(p1, 10) || 14));
  var dl = client.gcDays.slice(-nd);
  say("last " + dl.length + " day(s), newest last:");
  plain(rpad("date", 8) + lpad("net", 11) + lpad("in", 10) + lpad("out", 10) + lpad("fortune", 12));
  for (var di = 0; di < dl.length; di++) {
    var r = dl[di];
    plain(rpad(F.date(r[0]), 8) + lpad(F.s((r[3] || 0) - (r[4] || 0)), 11) + lpad(F.n(r[3] || 0), 10) + lpad(F.n(r[4] || 0), 10) + lpad(F.n(r[1] + r[2]), 12));
  }
}
else if (c === "new") {
  run_function("gc_close", [], "coffers");
  client.gcForce = true;
  say("session closed. The next prompt opens fresh books.");
  render();
}
else if (c === "goal") {
  if (p1 === "") { say(client.gcGoal > 0 ? "goal is to earn " + F.n(client.gcGoal) + " gold, counted from " + F.date(client.gcGoalT) + ". COFFERS GOAL OFF clears it." : "no goal set. Usage: COFFERS GOAL 50000 (or 50k, 1.5m): an amount to earn from now."); }
  else if (p1 === "off" || p1 === "0") { client.gcGoal = 0; client.gcGoalBase = -1; save("gc_goal", "0"); save("gc_goal_base", "-1"); say("goal cleared."); render(); }
  else {
    var ga = amt(p1);
    if (ga <= 0) { say("could not read '" + p1 + "' as an amount. Try 50000, 50k or 1.5m.", "orange"); }
    else {
      var gw = curWealth();
      if (!gw) { say("no reading of your purse yet, so there is nothing to count from. Try again after the next prompt.", "orange"); }
      else {
        client.gcGoal = ga;
        client.gcGoalBase = gw[0] + gw[1];
        client.gcGoalT = now;
        client.gcGoalDone = false;
        save("gc_goal", String(ga)); save("gc_goal_base", String(client.gcGoalBase)); save("gc_goal_t", String(now)); save("gc_goal_done", "0");
        say("goal set: earn " + F.n(ga) + " gold, counting from your current " + F.n(client.gcGoalBase) + ".");
        render();
      }
    }
  }
}
else if (c === "graph") {
  var which = p1;
  var mode = p2;
  if (which === "on" || which === "off") { mode = which; which = ""; }
  if (which === "" || which === "session") {
    client.gcGraphSess = mode === "on" ? true : (mode === "off" ? false : !client.gcGraphSess);
    save("gc_graph_sess", client.gcGraphSess ? "1" : "0");
  }
  if (which === "" || which === "long") {
    client.gcGraphLong = mode === "on" ? true : (mode === "off" ? false : !client.gcGraphLong);
    save("gc_graph_long", client.gcGraphLong ? "1" : "0");
  }
  say("session graph " + (client.gcGraphSess ? "shown" : "hidden") + ", day-by-day graphs " + (client.gcGraphLong ? "shown" : "hidden") + ".");
  render();
}
else if (c === "size") {
  var sz = parseInt(p1, 10) || 0;
  if (!sz) { say("graph height is " + client.gcChartH + ". Usage: COFFERS SIZE 40-400 (default 105)."); }
  else if (sz < 40 || sz > 400) { say("pick a height between 40 and 400.", "orange"); }
  else { client.gcChartH = sz; save("gc_graph_h", String(sz)); say("graph height set to " + sz + "."); render(); }
}
else if (c === "span") {
  var sv = parseInt(p2, 10) || 0;
  if (p1 !== "session" && p1 !== "long") { say("windows: session " + client.gcMins + " min, long " + client.gcDaySpan + " days. Usage: COFFERS SPAN SESSION 15-720 | COFFERS SPAN LONG 7-365."); }
  else if (p1 === "session" && (sv < 15 || sv > 720)) { say("session window must be 15-720 minutes.", "orange"); }
  else if (p1 === "long" && (sv < 7 || sv > 365)) { say("long window must be 7-365 days.", "orange"); }
  else {
    if (p1 === "session") { client.gcMins = sv; save("gc_span_mins", String(sv)); }
    else { client.gcDaySpan = sv; save("gc_span_days", String(sv)); }
    say(p1 + " window set to " + sv + (p1 === "session" ? " minutes." : " days.") + " Older points drop off at the next prompt.");
    render();
  }
}
else if (c === "gap") {
  var gv = parseInt(p1, 10) || 0;
  if (!gv) { say("a session closes after " + client.gcGap + " minutes without a prompt. Usage: COFFERS GAP 5-240."); }
  else if (gv < 5 || gv > 240) { say("gap must be 5-240 minutes.", "orange"); }
  else { client.gcGap = gv; save("gc_gap", String(gv)); say("sessions now close after " + gv + " silent minutes."); }
}
else if (c === "bigcoin") {
  var bv = p1 === "off" ? 0 : amt(p1);
  if (p1 === "") { say(client.gcBig > 0 ? "single changes of " + F.n(client.gcBig) + "+ gold are announced. COFFERS BIGCOIN OFF silences them." : "big-coin announcements are off. Usage: COFFERS BIGCOIN 1000 (or 1k)."); }
  else if (bv < 0) { say("could not read '" + p1 + "' as an amount.", "orange"); }
  else { client.gcBig = bv; save("gc_bigcoin", String(bv)); say(bv > 0 ? "announcing single changes of " + F.n(bv) + "+ gold." : "big-coin announcements off."); }
}
else if (c === "csv") {
  var cw2 = p1 || "days";
  if (cw2 === "session") {
    plain("datetime,unix,gold,bank,wealth");
    for (var ci = 0; ci < client.gcMin.length; ci++) { var mp = client.gcMin[ci]; plain(csvTime(mp[0]) + "," + mp[0] + "," + mp[1] + "," + mp[2] + "," + (mp[1] + mp[2])); }
  } else if (cw2 === "sessions") {
    plain("start,end,seconds,wealth_start,wealth_end,in,out,net,biggest_gain");
    for (var cj = 0; cj < client.gcSessions.length; cj++) { var so = client.gcSessions[cj]; plain(csvTime(so.s) + "," + csvTime(so.e) + "," + (so.e - so.s) + "," + so.w0 + "," + so.w1 + "," + so.inn + "," + so.out + "," + (so.inn - so.out) + "," + (so.big || 0)); }
  } else {
    plain("date,unix,gold,bank,wealth,in,out,net");
    for (var ck = 0; ck < client.gcDays.length; ck++) { var dp = client.gcDays[ck]; plain(csvTime(dp[0]).slice(0, 10) + "," + dp[0] + "," + dp[1] + "," + dp[2] + "," + (dp[1] + dp[2]) + "," + (dp[3] || 0) + "," + (dp[4] || 0) + "," + ((dp[3] || 0) - (dp[4] || 0))); }
  }
}
else if (c === "wipe") {
  if (p1 !== "confirm") { say("this burns the whole ledger: buffers, sessions, records. Type COFFERS WIPE CONFIRM to proceed.", "orange"); }
  else {
    client.gcMin = []; client.gcDays = []; client.gcSessions = []; client.gcRec = {}; client.gcSess = null;
    save("gc_min", "[]"); save("gc_days", "[]"); save("gc_sessions", "[]"); save("gc_rec", "{}"); save("gc_sess", "");
    client.gcForce = true;
    say("ledger burned. Fresh books open at the next prompt.", "red");
    render();
  }
}
else if (c === "rebuild") {
  client.gcF = undefined;
  client.gcTiers = undefined;
  run_function("gc_ensure", [], "coffers");
  say("helpers and rank table rebuilt.");
  render();
}
else if (c === "debug") {
  say("live: " + JSON.stringify(client.gcLive));
  var mg, mb;
  try { mg = get_variable("my_gold"); mb = get_variable("my_bank"); } catch (e) {}
  say("fallback vars: my_gold=" + mg + ", my_bank=" + mb);
  say("open session: " + JSON.stringify(client.gcSess));
  say("buffers: " + client.gcMin.length + " minute point(s), " + client.gcDays.length + " day(s), " + client.gcSessions.length + " closed session(s).");
  say("settings: span " + client.gcMins + "m/" + client.gcDaySpan + "d, gap " + client.gcGap + "m, bigcoin " + client.gcBig + ", goal " + client.gcGoal + " from " + client.gcGoalBase + ", height " + client.gcChartH + ".");
}
else if (c === "help") {
  say("COFFERS: fortune, session, today and records.");
  say("COFFERS SESSIONS [n] | COFFERS DAYS [n]: the books, as tables.");
  say("COFFERS NEW: close this session now. COFFERS GAP <min>: silence that closes one on its own.");
  say("COFFERS GOAL <amount|off>: earn this much from now (50000, 50k, 1.5m).");
  say("COFFERS BIGCOIN <amount|off>: announce single gains or losses this large.");
  say("COFFERS GRAPH [session|long] [on|off] | SIZE <40-400> | SPAN SESSION <min> | SPAN LONG <days>.");
  say("COFFERS CSV [days|session|sessions] | WIPE CONFIRM | REBUILD | DEBUG.");
}
else { say("unknown subcommand '" + c + "'. COFFERS HELP lists them.", "orange"); }