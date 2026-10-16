// "Your target is now: …": hidden right after the basher set your target
// itself (#123), so its own retargeting doesn't fill the screen; yours shows.
var B = client.loom && client.loom.basher;
if (B && B.gagUntil && Date.now() < B.gagUntil) { gag_current_line(); B.gagUntil = 0; }
