// Rift rows: all of them from our own reading, only gathered materials from
// one you typed.
if (client.loom && client.loom.gathering && client.loom.gathering.inRift) {
  var GA = client.loom.gathering;
  if (GA.ownRift) gag_current_line();
  var gaRe = /\[\s*([\d,]+)\]\s+(.+?)(?=\s+\[|\s*$)/g, gaM, gaAny = false;
  while ((gaM = gaRe.exec(args[0])) !== null) {
    if (GA.ownRift || GA.isRiftName(gaM[2])) { GA.stock[gaM[2]] = parseInt(gaM[1].replace(/,/g, ""), 10); gaAny = true; }
  }
  if (gaAny) GA.save();
}
