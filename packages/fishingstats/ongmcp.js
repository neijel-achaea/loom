// Room.Info gives the area fished in; Char.Name your own name, used as your
// angler name unless FISHINGSTATS ME sets one.
var fsM = "";
var fsA = null;
try { fsM = args.gmcp_method; fsA = args.gmcp_args; } catch (e) { fsM = ""; }
if ((fsM === "Room.Info" || fsM === "Char.Name") && fsA) {
  if (typeof fsA === "string") { try { fsA = JSON.parse(fsA); } catch (e) { fsA = null; } }
  if (fsA) {
    if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
    var FS = client.loom.fishingstats;
    if (fsM === "Room.Info" && fsA.area) {
      FS.areaGmcp = String(fsA.area);
      if (!FS.areaManual) { FS.areaNow = FS.areaGmcp; FS.areaSrc = "GMCP"; }
    }
    if (fsM === "Char.Name" && fsA.name) {
      FS.gmcpName = String(fsA.name);
      if (!FS.meSet) FS.me = FS.gmcpName;
    }
  }
}
