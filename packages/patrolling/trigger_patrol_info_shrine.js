//Enter the script here

if (client.patrol && client.patrol.active && client.patrol.gag && !/Number of objects/i.test(current_text())) { gag_current_line(); if (client.patrol.flagGaia || !/of\s+Gaia\b/i.test(current_text())) client.patrol.shrines.push(current_text().trim()); }