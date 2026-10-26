// Quests follows the room and your inventory itself: arriving ticks a GO
// step, an item coming or going ticks GET/BUY or GIVE.
if (!client.loom || !client.loom.questbook || !client.loom.questbook.list) run_function("questbook_setup", [], "questbook");
var QU = client.loom.questbook;
var quG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
var quM = args.gmcp_method;
if (quM == "Room.Info") {
  var quWas = QU.here ? QU.here.id : "";
  QU.here = quG.num ? { id: String(quG.num), name: QU.roomName(quG.name), area: String(quG.area || "") } : null;
  if (QU.here && QU.here.id !== quWas) { QU.onArrive(); run_function("questbook_render", [], "questbook"); }
} else if (quG.location == "inv") {
  if (quM == "Char.Items.List") {
    QU.inv = {};
    var quL = Array.isArray(quG.items) ? quG.items : [];
    for (var quI = 0; quI < quL.length; quI++) if (quL[quI] && quL[quI].id !== undefined) QU.inv[String(quL[quI].id)] = String(quL[quI].name || "");
  } else if (quM == "Char.Items.Add" && quG.item && typeof quG.item == "object") {
    var quAid = String(quG.item.id), quNew = !QU.inv.hasOwnProperty(quAid);
    QU.inv[quAid] = String(quG.item.name || "");
    if (quNew) QU.onInvAdd(QU.inv[quAid]);
  } else if (quM == "Char.Items.Remove" && quG.item !== undefined) {
    var quRid = String(typeof quG.item == "object" && quG.item ? quG.item.id : quG.item);
    var quName = QU.inv[quRid] || (typeof quG.item == "object" && quG.item ? String(quG.item.name || "") : "");
    delete QU.inv[quRid];
    if (quName) QU.onInvRemove(quName);
  }
}
