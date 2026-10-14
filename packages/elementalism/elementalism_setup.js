// elementalism_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, and the name and
// pronouns the set pieces use.
//
// PINK_DRAGON's lines are built from EL.name and EL.pronouns[EL.pron] by the
// script actions between its waits.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.elementalism) client.loom.elementalism = {};
client.loom.registry.elementalism = { version: "0.2.2", keyword: "ELEMENTALISM", desc: "{{description}}" };
var EL = client.loom.elementalism;

// [object, possessive], as the set pieces use them.
EL.pronouns = { he: ["him", "his"], she: ["her", "her"], they: ["them", "their"] };
function elGet(n) { var v; try { v = get_variable(n); } catch (e) { v = undefined; } return (v === undefined || v === null || ("" + v) === "undefined") ? "" : "" + v; }
// Your name, as the game sent it (Char.Name/Char.Status) or as set with
// ELEMENTALISM NAME; the game sends it only at login, so it's kept.
EL.name = elGet("elementalism_name");
EL.pron = elGet("elementalism_pronouns");
if (!EL.pronouns[EL.pron]) { EL.pron = "he"; set_variable("elementalism_pronouns", "he"); }
