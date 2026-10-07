// Called once a list rebuild has settled, so the final totals reach both
// persistent variables and the panel. Safe to fail: the next real event
// will do the same work.
run_function("tal_ensure", [], "talismans");
try { set_variable("tal_pieces", JSON.stringify(client.tal.pieces)); } catch (e) {}
run_function("tal_hist_record", [], "talismans");
run_function("tal_render", [], "talismans");