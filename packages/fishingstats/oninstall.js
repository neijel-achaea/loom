var have = false;
try { if (get_variable("fsh_session") !== undefined) { have = true; } } catch (e) { have = false; }
if (!have) { set_variable("fsh_session", ""); }
display_notice("[fishing] installed. Create a UI tab named 'fishingstats'. Casts, hooks and landings are parsed automatically for you and for others. Run FISHING RANKINGS once to load the yearly records. Tabs: 'fishingstats' and 'fishinglog'. Commands: fpstats, fpend, fplog, fparea, fpwhere, fpyear, fpgap, fpme, fpcolour, fpdemo, fpadd, fpcsv, fplearn.", "cyan");