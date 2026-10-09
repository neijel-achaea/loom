// PINK_DRAGON line 5 of 5: your name and pronouns from elementalism.
var E = (client.loom && client.loom.elementalism) || {};
var N = E.name || "";
var PR = (E.pronouns && E.pronouns[E.pron]) || ["him", "his"];
var O = PR[0], P = PR[1], Pc = P.charAt(0).toUpperCase() + P.slice(1);
if (!N) { } else send_command("cast illusion With a low rumbling from deep within " + P + " belly, " + N + " utters a guttural chant. " + Pc + " skin ripples as a web of magical confetti dances like fire across its surface, settling to solidify into a flexible, delicious shell.");
