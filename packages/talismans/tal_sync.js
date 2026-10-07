run_function("tal_ensure", [], "talismans");
try { set_variable("tal_pieces", JSON.stringify(client.tal.pieces)); } catch (e) {}
run_function("tal_hist_record", [], "talismans");
run_function("tal_render", [], "talismans");