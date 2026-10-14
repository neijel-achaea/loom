// defcon_aftermorph -- the morph DEFCON UP asked for has completed: send the
// class's "aftermorph" commands, once. Run from the metamorphosis line and
// from a Morph charstat change.
var D = client.loom.defcon;
if (D && D.afterMorph) {
  var dcAm = D.afterMorph.cmds;
  D.afterMorph = null;
  for (var dcI = 0; dcI < dcAm.length; dcI++) send_command(dcAm[dcI]);
}
