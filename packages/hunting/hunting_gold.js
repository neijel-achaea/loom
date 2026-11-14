// hunting_gold -- gold spilled from a corpse. AUTOGOLD ON picks it up when the
// kill was yours ("You have slain", "slain by <you>", or the experience it
// gave you) in the last 5 seconds, ALL picks up any gold, OFF leaves it. Into
// the backpack when security has one set. The pickup goes out a moment later
// (HU.goldWaitMs), so a ripple that ends on this kill (the Mnemosyne moves you
// on at once) cancels it; one refused because you were stunned or paralysed
// goes again once you can act (HU.goldLine). Ricardo's wade log, 2026-11-15:
// 10 of 101 piles missed.
if (!client.loom || !client.loom.hunting || !client.loom.hunting.classes) run_function("hunting_setup", [], "hunting");
var HU = client.loom.hunting;
var huMode = get_variable("hunting_autogold");
var huMine = HU.kill && (new Date().getTime() - HU.kill < 5000);
if (huMode == "all" || (huMode == "on" && huMine)) {
  if (get_variable("pauseTriggers") == "on") {
    display_notice("[hunting] gold left on the ground: triggers are paused.", "orange");
  } else {
    HU.kill = 0;
    HU.gold = { at: new Date().getTime(), sent: 0, tries: 0, retry: false };
    setTimeout(function () { client.loom.hunting.goldSend(); }, HU.goldWaitMs);
  }
}
