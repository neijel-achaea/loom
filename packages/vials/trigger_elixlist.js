// ELIXLIST capture for VIALS LEARN (#106). Only while a VIALS LEARN is under
// way (VI.learn), so an ELIXLIST typed by hand shows as usual. The table runs
// from its "Vial Fluid Sips Months" header to its second dashed line, which
// ends the capture; every line of it is hidden.
if (!client.loom || !client.loom.vials || !client.loom.vials.map) run_function("vials_setup", [], "vials");
var VI = client.loom.vials;
var L = VI.learn;
var elLine = String(args[0]);
if (L) {
  if (/^Vial\s+Fluid\s+Sips\s+Months\s*$/.test(elLine)) {
    L.stage = 1;
    gag_current_line();
  } else if (/^-{10,}\s*$/.test(elLine) && L.stage >= 1) {
    gag_current_line();
    if (L.stage === 1) L.stage = 2;
    else run_function("vials_learn", [], "vials");
  } else if (L.stage === 2) {
    var elM = elLine.match(/\bvial(\d+)\s+(.+?)\s+(\d+)\s+(---|\d+)\s*$/);
    if (elM) {
      L.rows.push({ vial: elM[1], fluid: elM[2], sips: parseInt(elM[3], 10), months: elM[4] === "---" ? null : parseInt(elM[4], 10) });
      gag_current_line();
    }
  }
}
