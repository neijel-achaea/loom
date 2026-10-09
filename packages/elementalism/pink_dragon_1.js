// PINK_DRAGON line 1 of 5: your name and pronouns from elementalism.
var E = (client.loom && client.loom.elementalism) || {};
var N = E.name || "";
var PR = (E.pronouns && E.pronouns[E.pron]) || ["him", "his"];
var O = PR[0], P = PR[1], Pc = P.charAt(0).toUpperCase() + P.slice(1);
if (!N) { display_notice("[elementalism] PINK_DRAGON needs your name: log in once, or ELEMENTALISM NAME <name>.", "orange"); } else send_command("cast illusion A pink light suddenly emanates from within " + N + ", willing forth the Dragon within " + O + ".");
