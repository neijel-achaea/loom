// patrolling_date -- today's Achaean date into P.dateTxt, from ledger when it
// is loaded (client.loom.ledger, or the pre-0.2 client.lg); "" otherwise.
var P = client.loom.patrolling;
var paLg = (client.loom.ledger && client.loom.ledger.day > 0) ? client.loom.ledger : client.lg;
var paDay = (paLg && paLg.day > 0) ? paLg.day : 0;
P.dateTxt = "";
if (paDay > 0) {
  var paN = paDay - 1;
  var paY = Math.floor(paN / 300);
  var paRem = paN - paY * 300;
  P.dateTxt = ((paRem % 25) + 1) + " " + P.months[Math.floor(paRem / 25)] + ", " + paY + " AF";
}
