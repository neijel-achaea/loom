// Only ask for a name if none is set yet: my_name is shared with other
// packages (fishstats reads it), so a reimport must not blank it.
var oiName = "";
try { oiName = String(get_variable("my_name") || ""); } catch (e) { oiName = ""; }
if (!oiName || oiName === "undefined") {
  set_variable("my_name", "");
  display_notice("Use SETNAME <name> to configure your own name.");
}