// PINK_DRAGON line 4 of 5: your name and pronouns from elementalism.
var E = (client.loom && client.loom.elementalism) || {};
var N = E.name || "";
var PR = (E.pronouns && E.pronouns[E.pron]) || ["him", "his"];
var O = PR[0], P = PR[1], Pc = P.charAt(0).toUpperCase() + P.slice(1);
if (!N) { } else send_command("cast illusion The saucer-sized eyes of " + N + " close briefly in ominous concentration.");
