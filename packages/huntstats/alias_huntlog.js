var log = [];
try { log = JSON.parse(get_variable("hs_log")) || []; } catch (e) { log = []; }
if (log.length === 0) { display_notice("[huntstats] no sessions logged yet", "yellow"); }
else {
  display_notice("[huntstats] Last " + log.length + " sessions:", "white");
  for (var i = 0; i < log.length; i++) {
    var s = log[i]; var m = Math.floor(s.ms / 60000); var dur = Math.floor(m / 60) + "h " + (m % 60) + "m";
    var pl = (s.players && s.players.length) ? ("  party: " + s.players.join(", ")) : "";
    var dg = (s.dGain !== null && s.dGain !== undefined) ? ("  +" + s.dGain.toFixed(3) + "% dragon") : "";
    display_notice("  " + s.area + " - " + dur + ", " + s.xp.toLocaleString() + " xp (" + s.xpHr.toLocaleString() + "/hr), " + s.gold.toLocaleString() + " gold, " + s.kills + " kills" + dg + pl);
  }
}