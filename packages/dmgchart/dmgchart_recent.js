// dmgchart_recent -- args {t, hp}: one health reading from Char.Vitals in
// client.loom.dmgchart.recent, for "health lasts" (how fast health is really
// falling, #153). Readings older than two minutes are dropped, but the last
// one before that is kept as the baseline for a window that reaches back past it.
var d = client.loom.dmgchart;
if (!d.recent) d.recent = [];
d.recent.push({ t: args.t, hp: args.hp });
var rcKeep = args.t - 120000;
while (d.recent.length > 1 && d.recent[1].t < rcKeep) d.recent.shift();
