// Builder guard. Safe to call from anywhere; does nothing once built.
if (!client.lg) {
  client.lg = {};
  client.lg.months = ["Sarapin", "Daedalan", "Aeguary", "Miraman", "Scarlatan", "Ero", "Valnuary", "Lupar", "Phaestian", "Chronos", "Glacian", "Mayan"];
  client.lg.day = 0;
  client.lg.armed = false;
  client.lg.inBlock = false;
  client.lg.pendingDigest = false;
  client.lg.debug = (get_variable("lg_debug") === "1");
  var stored = get_variable("lg_day");
  if (stored && ("" + stored).length) { client.lg.day = parseInt(stored, 10) || 0; }
  if (client.lg.debug) { display_notice("[ledger] built (day " + client.lg.day + ")", "cyan"); }
}
