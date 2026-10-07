if (!client.track || client.track.area === undefined) {
  display_notice("[huntstats] waiting for room data...", "yellow");
} else if (!client.track.firstXpAt) {
  display_notice("[huntstats] " + client.track.area + " - no kills yet this session", "yellow");
} else {
  var ms = Date.now() - client.track.firstXpAt;
  var mins = Math.floor(ms / 60000);
  var elapsed = Math.floor(mins / 60) + "h " + (mins % 60) + "m";
  var hrs = ms / 3600000;
  var xpHr = hrs > 0 ? Math.round(client.track.xp / hrs) : 0;
  var goldHr = hrs > 0 ? Math.round(client.track.gold / hrs) : 0;
  display_notice("[huntstats] " + client.track.area + " - " + elapsed);
  display_notice("[huntstats] xp:    " + client.track.xp.toLocaleString() + "  (" + xpHr.toLocaleString() + "/hr)");
  display_notice("[huntstats] gold:  " + client.track.gold.toLocaleString() + "  (" + goldHr.toLocaleString() + "/hr)");
  display_notice("[huntstats] kills: " + (client.track.kills || 0));

  run_function("hs_ensureTable", [], "huntstats");
  if (client.track.level !== undefined && client.track.nl !== undefined && client.dragonXP[Math.floor(client.track.level)] !== undefined) {
    var l = Math.floor(client.track.level);
    if (l < 99) {
      var b = client.dragonXP[l], n = client.dragonXP[l + 1];
      var expPerPct = (n - b) / 100;
      if (xpHr > 0 && expPerPct > 0) {
        var pctLeft = 100 - client.track.nl;
        var minsLeft = Math.round(((pctLeft * expPerPct) / xpHr) * 60);
        display_notice("[huntstats] level " + (l + 1) + " in ~" + Math.floor(minsLeft / 60) + "h " + (minsLeft % 60) + "m");
      }
    }
    var curDragon;
    if (l >= 99) { curDragon = 100; }
    else { var bb = client.dragonXP[l], nn = client.dragonXP[l + 1]; curDragon = ((bb + (client.track.nl / 100) * (nn - bb)) / client.dragonXP[99]) * 100; }
    var gainedTxt = "";
    if (client.track.startDragonPct !== null && client.track.startDragonPct !== undefined) {
      gainedTxt = "  (+" + (curDragon - client.track.startDragonPct).toFixed(3) + "% this session)";
    }
    
    if (l < 99 && xpHr > 0) {
      display_notice("[huntstats] Dragonhood: " + curDragon.toFixed(2) + "%" + gainedTxt, "white");
      var xpToDragon = client.dragonXP[99] - (client.dragonXP[l] + (client.track.nl / 100) * (client.dragonXP[l + 1] - client.dragonXP[l]));
      var hToDragon = xpToDragon / xpHr;
      display_notice("[huntstats] Dragonhood ETA: ~" + Math.floor(hToDragon) + "h " + Math.round((hToDragon - Math.floor(hToDragon)) * 60) + "m");
    }
  }
}