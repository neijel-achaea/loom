// Only inside a confirmed DATE block, so a stray "It is raining." is never eaten.
if (client.lg && client.lg.inBlock) { gag_current_line(); }