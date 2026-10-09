// Your name for the set pieces, from Char.Name / Char.Status at login.
var elM = "";
var elA = null;
try { elM = args.gmcp_method; elA = args.gmcp_args; } catch (e) { elM = ""; }
if ((elM === "Char.Name" || elM === "Char.Status") && elA) {
  if (typeof elA === "string") { try { elA = JSON.parse(elA); } catch (e) { elA = null; } }
  if (elA && elA.name) {
    if (!client.loom || !client.loom.elementalism || !client.loom.elementalism.pronouns) run_function("elementalism_setup", [], "elementalism");
    var EL = client.loom.elementalism;
    if (String(elA.name) !== EL.name) { EL.name = String(elA.name); set_variable("elementalism_name", EL.name); }
  }
}
