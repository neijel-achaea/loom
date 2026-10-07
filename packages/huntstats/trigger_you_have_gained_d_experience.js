if (client.track && client.track.area !== undefined) {
  var gained = parseInt(args[1], 10);
  if (!isNaN(gained)) {
    if (!client.track.firstXpAt) {
      client.track.firstXpAt = Date.now();
      run_function("hs_ensureTable", [], "huntstats");
      var sp = null;
      if (client.track.level !== undefined && client.track.nl !== undefined && client.dragonXP[Math.floor(client.track.level)] !== undefined) {
        var l = Math.floor(client.track.level);
        if (l >= 99) { sp = 100; }
        else { var b = client.dragonXP[l], n = client.dragonXP[l + 1]; sp = ((b + (client.track.nl / 100) * (n - b)) / client.dragonXP[99]) * 100; }
      }
      client.track.startDragonPct = sp;
    }
    client.track.xp += gained;
    client.track.lastXpAt = Date.now();

    // checkpoint the open bucket (throttled) so a refresh/crash/disconnect can recover it
    var nowMs = Date.now();
    if (!client.hsLastSave || (nowMs - client.hsLastSave) > 5000) {
      client.hsLastSave = nowMs;
      try { set_variable("hs_open", JSON.stringify(client.track)); } catch (e) {}
    }
  }
}