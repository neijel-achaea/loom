// Runs on every prompt. Wealth is gold on hand + bank, so a deposit or a
// withdrawal moves nothing; only money that enters or leaves the character
// counts as income or spending.
run_function("gc_ensure", [], "coffers");
var F = client.gcF;
var L = client.gcLive;
var g = L.gold;
var b = L.bank;
var now = Math.floor(new Date().getTime() / 1000);

// Fallback in case Nexus keeps its own copies under these names.
if (g === undefined) { try { var vg = parseInt(String(get_variable("my_gold")), 10); if (!isNaN(vg)) { g = vg; } } catch (e) {} }
if (b === undefined) { try { var vb = parseInt(String(get_variable("my_bank")), 10); if (!isNaN(vb)) { b = vb; } } catch (e) {} }

// Session buffer: one point per wall-clock minute, flat while idle.
function feedMin() {
  var arr = client.gcMin;
  if (arr.length === 0) { arr.push([now, g, b]); return true; }
  var last = arr[arr.length - 1];
  if (Math.floor(last[0] / 60) !== Math.floor(now / 60)) { arr.push([now, g, b]); return true; }
  if (last[1] !== g || last[2] !== b) { last[0] = now; last[1] = g; last[2] = b; return true; }
  return false;
}

// Day buffer: [t, gold, bank, in, out]. Days never played are carried
// forward flat with no flow. When a day closes it is checked for a record.
function feedDay() {
  var arr = client.gcDays;
  if (arr.length === 0) { arr.push([now, g, b, 0, 0]); return true; }
  var last = arr[arr.length - 1];
  if (last[3] === undefined) { last[3] = 0; }
  if (last[4] === undefined) { last[4] = 0; }
  if (F.dayKey(last[0]) === F.dayKey(now)) {
    if (last[1] !== g || last[2] !== b) { last[0] = now; last[1] = g; last[2] = b; return true; }
    return false;
  }
  var R = client.gcRec;
  var closedNet = last[3] - last[4];
  if (closedNet > 0 && (!R.bestDay || closedNet > R.bestDay.net)) {
    R.bestDay = { net: closedNet, t: last[0] };
    display_notice("[coffers] yesterday's books are closed: " + F.s(closedNet) + " gold. A new best day!", "gold");
  }
  var cut = now - client.gcDaySpan * 86400;
  var todayStart = F.dayStart(now);
  var cur = new Date(F.dayStart(last[0]) * 1000);
  cur.setDate(cur.getDate() + 1);
  var guard = 0;
  while (Math.floor(cur.getTime() / 1000) < todayStart && guard < 400) {
    var noon = Math.floor(cur.getTime() / 1000) + 43200;
    if (noon >= cut) { arr.push([noon, last[1], last[2], 0, 0]); }
    cur.setDate(cur.getDate() + 1);
    guard++;
  }
  arr.push([now, g, b, 0, 0]);
  return true;
}

if (g !== undefined && b !== undefined) {
  var W = g + b;
  var R = client.gcRec;
  var changed = false;
  var force = client.gcForce ? true : false;
  client.gcForce = false;

  // A silence longer than the gap closes the old session before this one opens.
  if (client.gcSess && (now - client.gcSess.last) > client.gcGap * 60) {
    run_function("gc_close", [], "coffers");
  }
  if (!client.gcSess) {
    client.gcSess = { s: now, last: now, w0: W, w1: W, inn: 0, out: 0, peak: W, low: W, big: 0 };
    changed = true;
    force = true;
    display_notice("[coffers] the books are open: " + F.n(W) + " gold (" + F.n(g) + " in the purse, " + F.n(b) + " in the bank).", "gold");
  }
  var S = client.gcSess;
  S.last = now;

  if (feedMin()) { changed = true; }
  if (feedDay()) { changed = true; }
  var T = client.gcDays[client.gcDays.length - 1];

  // S.w1 is the last wealth this session accounted for. It is persisted with
  // the day row, so a reload mid-session neither loses nor double counts.
  var d = W - S.w1;
  if (d !== 0) {
    if (d > 0) {
      S.inn += d;
      T[3] += d;
      if (d > S.big) { S.big = d; }
    } else {
      S.out -= d;
      T[4] -= d;
    }
    S.w1 = W;
    if (W > S.peak) { S.peak = W; }
    if (W < S.low) { S.low = W; }
    changed = true;
    force = true;
    if (client.gcBig > 0 && d >= client.gcBig) {
      display_notice("[coffers] Ka-ching! " + F.s(d) + " gold. Session " + F.s(S.inn - S.out) + ", fortune " + F.n(W) + ".", "gold");
    } else if (client.gcBig > 0 && -d >= client.gcBig) {
      display_notice("[coffers] " + F.n(-d) + " gold just left the purse. Session " + F.s(S.inn - S.out) + ".", "orange");
    }
  }

  if (!R.peak || W > R.peak.w) { R.peak = { w: W, t: now }; }
  // The ratchet stores the threshold reached, not the table index, so the
  // tier table can be edited without confusing it.
  var ti = F.tier(W);
  var tAt = client.gcTiers[ti][0];
  if (R.tierAt === undefined) { R.tierAt = tAt; force = true; }
  else if (tAt > R.tierAt) {
    R.tierAt = tAt;
    force = true;
    display_notice("[coffers] *** MILESTONE *** your fortune passes " + F.n(client.gcTiers[ti][0]) + " gold. Welcome to the " + client.gcTiers[ti][1] + ".", "gold");
  }

  // Goal: take the base on the first reading after it was set, and announce
  // once when the earnings since then reach the target.
  if (client.gcGoal > 0) {
    if (client.gcGoalBase < 0) {
      client.gcGoalBase = W;
      client.gcGoalT = now;
      try { set_variable("gc_goal_base", String(W)); set_variable("gc_goal_t", String(now)); } catch (e) {}
    } else if (!client.gcGoalDone && W - client.gcGoalBase >= client.gcGoal) {
      client.gcGoalDone = true;
      try { set_variable("gc_goal_done", "1"); } catch (e) {}
      display_notice("[coffers] *** GOAL REACHED *** " + F.s(client.gcGoal) + " gold earned since " + F.date(client.gcGoalT) + ". Set the next one with COFFERS GOAL.", "gold");
    }
  }

  // Trailing windows: anything older than the span falls off the front.
  var minCut = now - client.gcMins * 60;
  while (client.gcMin.length > 0 && client.gcMin[0][0] < minCut) { client.gcMin.shift(); }
  var dayCut = now - client.gcDaySpan * 86400;
  while (client.gcDays.length > 1 && client.gcDays[0][0] < dayCut) { client.gcDays.shift(); }

  var lw = client.gcLastWrite || 0;
  if (changed && (force || (now - lw) >= 5)) {
    client.gcLastWrite = now;
    try { set_variable("gc_min", JSON.stringify(client.gcMin)); } catch (e) {}
    try { set_variable("gc_days", JSON.stringify(client.gcDays)); } catch (e) {}
    try { set_variable("gc_sess", JSON.stringify(client.gcSess)); } catch (e) {}
    try { set_variable("gc_rec", JSON.stringify(client.gcRec)); } catch (e) {}
  }
  if (changed) { run_function("gc_render", [], "coffers"); }
}