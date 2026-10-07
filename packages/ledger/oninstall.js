// Create persistent stores only if absent, so a reimport never clobbers data.
var have = false;
try { if (get_variable("lg_items") !== undefined && ("" + get_variable("lg_items")).length) { have = true; } } catch (e) { have = false; }
if (!have) { set_variable("lg_items", "[]"); set_variable("lg_seq", "0"); }
display_notice("[ledger] installed. Create a UI tab named 'Ledger', and add the onLoad reflex.", "cyan");
