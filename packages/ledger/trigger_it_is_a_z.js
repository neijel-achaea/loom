// Only inside a confirmed DATE block, so a stray "It is raining." is never eaten.
if (client.loom && client.loom.ledger && client.loom.ledger.inBlock) { gag_current_line(); }