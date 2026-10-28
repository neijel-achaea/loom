// Runs once per prompt, from Char.Vitals (see onGMCP). Wealth is gold on hand + bank, so a deposit or a
// withdrawal moves nothing; only money that enters or leaves the character
// counts as income or spending.
if (!client.loom || !client.loom.coffers || !client.loom.coffers.f) run_function("coffers_setup", [], "coffers");
var CO = client.loom.coffers;
var F = CO.f;
var L = CO.live;
var g = L.gold;
var b = L.bank;
var now = Math.floor(new Date().getTime() / 1000);

// Session buffer: one point per wall-clock minute, flat while idle.
function feedMin() {
  var arr = CO.min;
  if (arr.length === 0) { arr.push([now, g, b]); return true; }
  var last = arr[arr.length - 1];
  if (Math.floor(last[0] / 60) !== Math.floor(now / 60)) { arr.push([now, g, b]); return true; }
  if (last[1] !== g || last[2] !== b) { last[0] = now; last[1] = g; last[2] = b; return true; }
  return false;
}

// Day buffer: [t, gold, bank, in, out]. Days never played are carried
// forward flat with no flow. When a day closes it is checked for a record.
function feedDay() {
  var arr = CO.days;
  if (arr.length === 0) { arr.push([now, g, b, 0, 0]); return true; }
  var last = arr[arr.length - 1];
  if (last[3] === undefined) { last[3] = 0; }
  if (last[4] === undefined) { last[4] = 0; }
  if (F.dayKey(last[0]) === F.dayKey(now)) {
    if (last[1] !== g || last[2] !== b) { last[0] = now; last[1] = g; last[2] = b; return true; }
    return false;
  }
  var R = CO.rec;
  var closedNet = last[3] - last[4];
  if (closedNet > 0 && (!R.bestDay || closedNet > R.bestDay.net)) {
    R.bestDay = { net: closedNet, t: last[0] };
    display_notice("[coffers] yesterday's books are closed: " + F.s(closedNet) + " gold. A new best day!", "lime");
  }
  var cut = now - CO.daySpan * 86400;
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
  var R = CO.rec;
  var changed = false;
  var force = CO.force ? true : false;
  CO.force = false;

  // A silence longer than the gap closes the old session before this one opens.
  if (CO.sess && (now - CO.sess.last) > CO.gap * 60) {
    run_function("coffers_close", [], "coffers");
  }
  if (!CO.sess) {
    CO.sess = { s: now, last: now, w0: W, w1: W, inn: 0, out: 0, peak: W, low: W, big: 0 };
    changed = true;
    force = true;
    display_notice("[coffers] the books are open: " + F.n(W) + " gold (" + F.n(g) + " in the purse, " + F.n(b) + " in the bank).", "cyan");
  }
  var S = CO.sess;
  S.last = now;

  // The recoup threshold as it stood before this reading (#234): a spend
  // mustn't lower the per-day figure it is measured against.
  var rcLine = CO.recoupLine ? CO.recoupLine() : 0;
  if (feedMin()) { changed = true; }
  if (feedDay()) { changed = true; }
  var T = CO.days[CO.days.length - 1];

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
    if (CO.big > 0 && d >= CO.big) {
      display_notice("[coffers] Ka-ching! " + F.s(d) + " gold. Session " + F.s(S.inn - S.out) + ", fortune " + F.n(W) + ".", "lime");
    } else if (CO.big > 0 && -d >= CO.big) {
      display_notice("[coffers] " + F.n(-d) + " gold just left the purse. Session " + F.s(S.inn - S.out) + ".", "orange");
    }
  }
  // A big spend proposes earning it back; recovering withdraws it (#234).
  if (CO.recoupCheck) CO.recoupCheck(W, d, rcLine);

  if (!R.peak || W > R.peak.w) { R.peak = { w: W, t: now }; }
  // The ratchet stores the threshold reached, not the table index, so the
  // tier table can be edited without confusing it.
  var ti = F.tier(W);
  var tAt = CO.tiers[ti][0];
  if (R.tierAt === undefined) { R.tierAt = tAt; force = true; }
  else if (tAt > R.tierAt) {
    R.tierAt = tAt;
    force = true;
    display_notice("[coffers] *** MILESTONE *** your fortune passes " + F.n(CO.tiers[ti][0]) + " gold. Welcome to the " + CO.tiers[ti][1] + ".", "lime");
  }

  // Goal: take the base on the first reading after it was set, and announce
  // once when the earnings since then reach the target.
  if (CO.goal > 0) {
    if (CO.goalBase < 0) {
      CO.goalBase = W;
      CO.goalT = now;
      try { set_variable("coffers_goal_base", String(W)); set_variable("coffers_goal_t", String(now)); } catch (e) {}
    } else if (!CO.goalDone && W - CO.goalBase >= CO.goal) {
      CO.goalDone = true;
      try { set_variable("coffers_goal_done", "1"); } catch (e) {}
      display_notice("[coffers] *** GOAL REACHED *** " + F.s(CO.goal) + " gold earned since " + F.date(CO.goalT) + ". Set the next one with COFFERS GOAL.", "lime");
    }
  }

  // Trailing windows: anything older than the span falls off the front.
  var minCut = now - CO.mins * 60;
  while (CO.min.length > 0 && CO.min[0][0] < minCut) { CO.min.shift(); }
  var dayCut = now - CO.daySpan * 86400;
  while (CO.days.length > 1 && CO.days[0][0] < dayCut) { CO.days.shift(); }

  var lw = CO.lastWrite || 0;
  if (changed && (force || (now - lw) >= 5)) {
    CO.lastWrite = now;
    try { set_variable("coffers_min", JSON.stringify(CO.min)); } catch (e) {}
    try { set_variable("coffers_days", JSON.stringify(CO.days)); } catch (e) {}
    try { set_variable("coffers_sess", JSON.stringify(CO.sess)); } catch (e) {}
    try { set_variable("coffers_rec", JSON.stringify(CO.rec)); } catch (e) {}
  }
  if (changed) { run_function("coffers_render", [], "coffers"); }
}