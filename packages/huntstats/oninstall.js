// Initialise persistent stores without clobbering existing data on reimport.
var have = false;
try { if (get_variable("hs_log") !== undefined) { have = true; } } catch (e) { have = false; }
if (!have) { set_variable("hs_areas", "{}"); set_variable("hs_log", "[]"); }
set_variable("hs_open", "");
display_notice("[huntstats] installed. Create a UI tab named 'Stats' for the live panel.", "cyan");