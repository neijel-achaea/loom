// Rift rows: minerals only, from our own reading or one you typed.
if (client.loom && client.loom.transmutation && client.loom.transmutation.inRift) {
  var TR = client.loom.transmutation;
  if (TR.ownRift) gag_current_line();
  var trRe = /\[\s*([\d,]+)\]\s+(.+?)(?=\s+\[|\s*$)/g, trM, trAny = false;
  while ((trM = trRe.exec(args[0])) !== null) {
    if (TR.known(trM[2])) { TR.stock[trM[2].toLowerCase()] = parseInt(trM[1].replace(/,/g, ""), 10); trAny = true; }
  }
  if (trAny) TR.save();
}
