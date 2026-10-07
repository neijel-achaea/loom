// Auto-called by Nexus on every GMCP message.
// NOTE: if you already run an onGMCP in another package and Nexus only honours
// one, copy the blocks below into that handler instead and disable this function.

// --- resume-or-bank an interrupted session (runs once per connection) ---
// client.* is wiped on refresh/reconnect, so client.hsResumed is undefined again,
// and hs_open (a saved variable) survives to be recovered here.
if (!client.hsResumed) {
  client.hsResumed = true;
  var _saved = "";
  try { _saved = get_variable("hs_open"); } catch (e) { _saved = ""; }
  if (_saved) {
    var _b = null;
    try { _b = JSON.parse(_saved); } catch (e) { _b = null; }
    if (_b && _b.firstXpAt && _b.xp > 0) {
      var _idle = Date.now() - (_b.lastXpAt || _b.firstXpAt);
      client.track = _b;
      if (_idle < 600000) {
        display_notice("[huntstats] resumed session in " + _b.area + " (" + _b.xp.toLocaleString() + " xp so far)", "cyan");
      } else {
        run_function("hs_finalize", [], "huntstats");
        display_notice("[huntstats] banked interrupted session in " + _b.area, "cyan");
      }
    } else {
      try { set_variable("hs_open", ""); } catch (e) {}
    }
  }
}

if (args.gmcp_method === "Char.Vitals") {
  var v = args.gmcp_args;
  if (v) {
    if (!client.track) { client.track = {}; }
    // live update on every push (nl here is an integer, e.g. "58")
    if (v.nl !== undefined) {
      var nlv = parseFloat(v.nl);
      if (!isNaN(nlv)) { client.track.nl = nlv; }
    }
    // refine to the precise decimal + capture level when charstats is present
    if (v.charstats && v.charstats[0]) {
      var mm = String(v.charstats[0]).match(/Level:\s*(\d+)\s*\(([\d.]+)%\)/);
      if (mm) { client.track.level = parseInt(mm[1], 10); client.track.nl = parseFloat(mm[2]); }
    }
  }

  // --- update F9 Dragonhood % button ---
  run_function("hs_ensureTable", [], "huntstats");
  if (client.track && client.track.level !== undefined && client.track.nl !== undefined && client.dragonXP[Math.floor(client.track.level)] !== undefined) {
    var _l = Math.floor(client.track.level);
    var _pct;
    if (_l >= 99) { _pct = 100; }
    else { var _bb = client.dragonXP[_l], _n = client.dragonXP[_l + 1]; _pct = ((_bb + (client.track.nl / 100) * (_n - _bb)) / client.dragonXP[99]) * 100; }
    var _label = "DH " + _pct.toFixed(2) + "%";
    if (_label !== client._dragonBtnLabel) {
      client._dragonBtnLabel = _label;
      try { buttons_set_label(9, _label); } catch (e) {}
    }
  }
}

if (args.gmcp_method === "Room.Info") {
  var info = args.gmcp_args;
  if (info && info.area) {
    if (!client.track) { client.track = {}; }
    if (client.track.area === undefined) {
      client.track.area = info.area;
      client.track.xp = 0; client.track.gold = 0; client.track.kills = 0;
      client.track.firstXpAt = 0; client.track.lastXpAt = 0;
      client.track.startDragonPct = null; client.track.players = {};
    } else if (info.area !== client.track.area) {
      run_function("hs_finalize", [], "huntstats");
      client.track.area = info.area;
    }
  }
}

if (args.gmcp_method === "Room.Players") {
  var ps = args.gmcp_args;
  if (ps && ps.length && client.track) {
    if (!client.track.players) { client.track.players = {}; }
    for (var i = 0; i < ps.length; i++) {
      if (ps[i] && ps[i].name) { client.track.players[ps[i].name] = 1; }
    }
  }
}