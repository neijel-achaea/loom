if (!client.track) { client.track = {}; }
var lvl = parseInt(args[1], 10);
var pct = parseFloat(args[2]);
if (!isNaN(lvl)) { client.track.level = lvl; }
if (!isNaN(pct)) { client.track.nl = pct; }

set_variable("my_level", lvl);