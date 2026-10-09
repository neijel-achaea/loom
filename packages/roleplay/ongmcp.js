// The class the emotes and ambient emotes follow, from Char.Status. On a
// change (dragonform included) it's kept, and a built ambient emote engine
// is rebuilt with that class's pool.
var rpM = "";
var rpA = null;
try { rpM = args.gmcp_method; rpA = args.gmcp_args; } catch (e) { rpM = ""; }
if (rpM === "Char.Status" && rpA) {
  if (typeof rpA === "string") { try { rpA = JSON.parse(rpA); } catch (e) { rpA = null; } }
  if (rpA && rpA["class"]) {
    if (!client.loom || !client.loom.roleplay || client.loom.roleplay.cls === undefined) run_function("roleplay_setup", [], "roleplay");
    var RP = client.loom.roleplay;
    if (String(rpA["class"]) !== RP.cls) {
      RP.cls = String(rpA["class"]);
      set_variable("roleplay_class", RP.cls);
      if (RP.aem) run_function("roleplay_aem", [], "roleplay");
    }
  }
}
