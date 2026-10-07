if (!client.wl) { display_notice("[social] not built - trigger any line to build.", "cyan"); }
else {
  var W = client.wl;
  var primed = W.prev ? ("yes (" + Object.keys(W.prev).length + ")") : "no";
  display_notice("[social] built | polling " + (W.enabled ? "ON" : "OFF") + " every " + (W.interval / 1000) + "s | primed " + primed + " | timer " + (W.timer ? "set" : "NONE") + " | debug " + (W.debug ? "ON" : "OFF") + " | lastCount " + (W.lastCount || 0), "cyan");
}