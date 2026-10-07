if (!client.wl) {
  client.wl = {};
  var W = client.wl;

  W.interval = 5000;                       // poll cadence in ms
  W.enabled  = (get_variable("wlEnabled") !== "0");
  W.debug    = (get_variable("wlDebug") === "1");
  W.prev = null;                            // {lowerName:true} once primed; null = unprimed
  W.capturing = false;
  W.reportOnce = false;
  W.lastCount = 0;
  W.buf = [];
  W.reNames  = /^[A-Z][a-z]+(?:,\s*[A-Z][a-z]+)*(?:,?\s*and\s+[A-Z][a-z]+)?\.?$/;
  W.reFooter = /^Plus another \d+/;

  var order;
  if (client.hl && client.hl.groups) { order = client.hl.groups.slice(); }
  else { order = ["family","enemies","order","house","city","allies","friends"]; }
  W.order = order;

  W.watch = {};
  var wlSaved = (get_variable("wlWatch") || "").trim();
  if (wlSaved.length) {
    var on = {};
    wlSaved.split(",").forEach(function (s) { s = s.trim(); if (s) on[s] = true; });
    W.order.forEach(function (g) { W.watch[g] = !!on[g]; });
  } else {
    W.order.forEach(function (g) { W.watch[g] = true; });   // default: watch every group
  }

  W.saveWatch = function () {
    var arr = [];
    W.order.forEach(function (g) { if (W.watch[g]) arr.push(g); });
    set_variable("wlWatch", arr.join(","));
  };

  // name -> {group,color}, highest-priority watched group wins
  W.index = function () {
    var idx = {};
    if (!client.hl) return idx;
    var i, g, members, n;
    for (i = 0; i < W.order.length; i++) {
      g = W.order[i];
      if (!W.watch[g]) continue;
      members = client.hl[g] || {};
      for (n in members) { if (!idx[n]) idx[n] = { group: g, color: client.hl.color[g] }; }
    }
    return idx;
  };

  W.notify = function (name, idx, online) {
    var hit = idx[name];
    if (!hit) return;
    var disp = name.charAt(0).toUpperCase() + name.slice(1);
    display_notice("[social] " + disp + (online ? " has awoken." : " has drifted into slumber."), hit.color);
  };

  W.snapshot = function (names) {
    var now = {}, i, n, up = 0, down = 0;
    for (i = 0; i < names.length; i++) now[names[i].toLowerCase()] = true;
    if (W.prev === null) { W.prev = now; return { primed: true, online: 0, offline: 0, total: names.length }; }
    var idx = W.index();
    for (n in now)    { if (!W.prev[n]) { W.notify(n, idx, true);  up++; } }
    for (n in W.prev) { if (!now[n])  { W.notify(n, idx, false); down++; } }
    W.prev = now;
    return { primed: false, online: up, offline: down, total: names.length };
  };

  W.parse = function (text) {
    text = text.replace(/Plus another[\s\S]*$/, "");
    text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
    var out = [], parts = text.split(/,|\band\b/), i, s;
    for (i = 0; i < parts.length; i++) {
      s = parts[i].replace(/[^A-Za-z]/g, "");
      if (/^[A-Z][a-z]+$/.test(s)) out.push(s);
    }
    return out;
  };

  W.flush = function () {
    W.capturing = false;
    clearTimeout(W.safetyT);
    clearTimeout(W.flushT);
    var names = W.parse(W.buf.join(" "));
    W.buf = [];
    W.lastCount = names.length;
    if (!names.length) {
      if (W.reportOnce) { display_notice("[social] poll returned no names (kept previous set)"); W.reportOnce = false; }
      return;
    }
    var r = W.snapshot(names);
    if (W.reportOnce || W.debug) {
      var msg;
      if (r.primed) { msg = "[social] primed with " + r.total + " names"; }
      else { msg = "[social] poll: " + r.online + " new, " + r.offline + " gone (" + r.total + " online)"; }
      display_notice(msg, "cyan");
      W.reportOnce = false;
    }
  };

    W.poll = function () {
      if (!W.enabled) return;
      var pause = get_variable("pauseTriggers");
      if (pause != "off") return;

      if (W.debug) display_notice("[social] tick -> qw");
      W.buf = [];
      W.capturing = true;
      clearTimeout(W.safetyT);
      W.safetyT = setTimeout(function () { W.flush(); }, 1500);
      send_command("qw");
    };

  if (W.timer) clearInterval(W.timer);
  W.timer = setInterval(function () { W.poll(); }, W.interval);
}

// capture phase: active only inside a poll window, only for qw-shaped lines
if (client.wl && client.wl.capturing) {
  var L = args[1];
  if (L === "qw") { gag_current_line(); }
  else if (client.wl.reFooter.test(L) || client.wl.reNames.test(L)) {
    client.wl.buf.push(L);
    clearTimeout(client.wl.flushT);
    client.wl.flushT = setTimeout(function () { client.wl.flush(); }, 5000);
    gag_current_line();
  }
}