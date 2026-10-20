// artificing_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of
// staffAttack, then the settings.
//
// Publishes the staff attack (the ability STAFF CAST uses: scintilla,
// horripilation or lightning) at client.loom.artificing.staff and in the
// artificing_staff variable; hunting reads it for the magi staff key.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.artificing) client.loom.artificing = {};
client.loom.registry.artificing = { version: "0.2.3", keyword: "ARTIFICING", desc: "{{description}}" };
var AR = client.loom.artificing;

// One-time migration: staffAttack -> artificing_staff.
var arOld;
try { arOld = get_variable("staffAttack"); } catch (e) { arOld = undefined; }
if (arOld !== undefined && arOld !== null) {
  var arHave;
  try { arHave = get_variable("artificing_staff"); } catch (e) { arHave = undefined; }
  if (!arHave && ("" + arOld) !== "") set_variable("artificing_staff", "" + arOld);
  delete_variable("staffAttack");
}

// Staff attacks by element, and the elementals a treaty can be formed with.
AR.staffs = { fire: "scintilla", frost: "horripilation", lightning: "lightning" };
AR.elementals = ["waterweird", "djinn", "sandling", "efreeti", "stoneback", "breath", "mistfiend", "ashbeast"];
if (AR.staff === undefined) {
  var arS;
  try { arS = get_variable("artificing_staff"); } catch (e) { arS = undefined; }
  AR.staff = (arS && ("" + arS) !== "undefined") ? "" + arS : "scintilla";
}
// The treaty being formed, if any: { elemental, at }.
if (AR.treaty === undefined) AR.treaty = null;
