// Initialise the history store without clobbering it on reimport.
var have = false;
try { if (get_variable("lvl_hist") !== undefined) { have = true; } } catch (e) { have = false; }
if (!have) { set_variable("lvl_day", "[]"); set_variable("lvl_min", "[]"); }
display_notice("[level] installed. Create a UI tab named 'Level' for the panel. Commands: lvlrate, lvlmark, lvlgraph [session|long] on|off, lvlgraphsize 40-400, lvlspan session <min> / long <days>, lvlhistcsv [session], lvlhistwipe confirm.", "cyan");