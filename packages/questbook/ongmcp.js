// Questbook follows the room itself: arriving ticks a GO step.
if (!client.loom || !client.loom.questbook || !client.loom.questbook.list) run_function("questbook_setup", [], "questbook");
var QU = client.loom.questbook;
var quG = (args.gmcp_args && typeof args.gmcp_args == "object") ? args.gmcp_args : {};
var quM = args.gmcp_method;
if (quM == "Room.Info") {
  var quWas = QU.here ? QU.here.id : "";
  QU.here = quG.num ? { id: String(quG.num), name: QU.roomName(quG.name), area: String(quG.area || "") } : null;
  if (QU.here && QU.here.id !== quWas) { QU.onArrive(); run_function("questbook_render", [], "questbook"); }
}
