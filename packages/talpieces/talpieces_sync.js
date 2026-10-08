if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
try { set_variable("talpieces_pieces", JSON.stringify(TP.pieces)); } catch (e) {}
run_function("talpieces_record", [], "talpieces");
run_function("talpieces_render", [], "talpieces");