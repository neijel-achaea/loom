// Initialise the persistent stores without clobbering existing data on reimport.
var have = false;
try { if (get_variable("tal_pieces") !== undefined) { have = true; } } catch (e) { have = false; }
if (!have) { set_variable("tal_pieces", "{}"); }
var haveH = false;
try { if (get_variable("tal_hist") !== undefined) { haveH = true; } } catch (e) { haveH = false; }
if (!haveH) { set_variable("tal_hist", "[]"); }
display_notice("[talismans] installed. Tabs: 'Talismans' for the panel, optional 'TalGraph' for a larger chart. Commands: dtneed, talrate, talmark, talgraph on|off, talgraphsize, talseed YYYY-MM-DD [common] [rare], talhistcsv, talhistwipe, talwipe.", "cyan");