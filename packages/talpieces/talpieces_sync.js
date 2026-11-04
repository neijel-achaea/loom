if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
try { set_variable("talpieces_pieces", JSON.stringify(TP.pieces)); } catch (e) {}
run_function("talpieces_record", [], "talpieces");
// A goal of your own reached (#460), checked once the listing has settled.
if (!TP.building && TP.goalCheck) TP.goalCheck();
run_function("talpieces_render", [], "talpieces");
// The piece count is what talpieces' look reports (#54): tell loom, but not
// mid-way through a listing rebuild (its flush tells it once, settled).
if (!TP.building && client.loom.notify) client.loom.notify("talpieces");
