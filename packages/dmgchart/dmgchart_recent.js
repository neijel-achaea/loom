// dmgchart_recent -- args {t, inc, heal}: one entry in client.loom.dmgchart.recent,
// the incoming damage and healing of the last few seconds, for health lasts (#153).
// Entries older than the window (at most two minutes) are dropped.
var d = client.loom.dmgchart;
if (!d.recent) d.recent = [];
d.recent.push({ t: args.t, inc: args.inc || 0, heal: args.heal || 0 });
var rcKeep = args.t - Math.min(120, Math.max(d.window || 10, 1)) * 1000;
while (d.recent.length && d.recent[0].t < rcKeep) d.recent.shift();
