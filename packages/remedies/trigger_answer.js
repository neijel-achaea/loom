// The game's other answers to BREW and POUR (Ricardo's lines, #436).
var RM = client.loom && client.loom.remedies;
if (RM && RM.run) {
  var rmL = String(args[0] || "");
  var rmM;
  if ((rmM = /^That pot already contains (.+)!$/.exec(rmL))) RM.potFull(rmM[1]);
  else if (/^You lack the required ingredients to brew that\.$/.test(rmL)) RM.noIngredients();
  else if (/^That is not a pot\.$/.test(rmL)) RM.notPot();
  else if (/^Your rift is already full\.$/.test(rmL)) { if (RM.run.out == "pourOld") RM.oldPoured(false); else RM.full(); }
  else if (/ is empty\.$/.test(rmL)) { if (RM.run.out == "pourOld") RM.oldPoured(true); else RM.empty(); }
}
