// Your own say or emote: the work is in roleplay_gmcp (#136: this runs on most lines, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.roleplay;
if (!lkH || !lkH.line) { run_function("roleplay_gmcp", [], "roleplay"); lkH = client.loom.hooks.roleplay; }
lkH.line(args);
