// PINK_DRAGON line 3 of 5: your name and pronouns from elementalism.
var E = (client.loom && client.loom.elementalism) || {};
var N = E.name || "";
var PR = (E.pronouns && E.pronouns[E.pron]) || ["him", "his"];
var O = PR[0], P = PR[1], Pc = P.charAt(0).toUpperCase() + P.slice(1);
if (!N) { } else send_command("cast illusion Reveling in " + P + " power, " + N + " beats " + P + " mighty wings, throws " + P + " massive head back, and roars a challenge as if to the world itself.");
