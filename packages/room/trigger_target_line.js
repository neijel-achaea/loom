// The game's own confirmation of a new target (ST / SETTARGET), e.g.
// "Your target is now: Rat (a denizen)". Ricardo, #205: after targeting a
// player, ST RAT left the player lit. This line arrives whatever GMCP does or
// doesn't send, so it sets the target too, as a word (a player's name, or a
// word in a mob's name): whichever of this, IRE.Target.*, or the tar variable
// changed last decides the glow.
if (!client.loom || !client.loom.room || !client.loom.room.raw) run_function("room_setup", [], "room");
var R = client.loom.room;
var tlName = String(args[1] || "").trim();
if (tlName) {
  R.target = { id: tlName, name: "", hp: "", at: Date.now(), line: String(args[2] || "") };
  clearTimeout(R.drawT);
  R.drawT = setTimeout(function () { run_function("room_render", [], "room"); }, 50);
}
