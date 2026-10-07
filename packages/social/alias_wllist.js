if (!client.wl) { display_notice("[social] not ready yet - trigger any line to build.", "cyan"); }
else {
  var on = [], off = [], i, g;
  for (i = 0; i < client.wl.order.length; i++) {
    g = client.wl.order[i];
    if (client.wl.watch[g]) on.push(g); else off.push(g);
  }
  display_notice("[social] polling " + (client.wl.enabled ? "ON" : "OFF") + ", every " + (client.wl.interval / 1000) + "s", "cyan");
  display_notice("[social] watching (priority order): " + (on.length ? on.join(", ") : "none", "cyan"));
  display_notice("[social] ignoring: " + (off.length ? off.join(", ") : "none"), "cyan");
}