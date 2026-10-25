// roleplay_seeds -- the starting emotes, run by roleplay_setup. A list takes
// its seeds once, the first time it's in use, and is the player's after that;
// ROLEPLAY AEM RESET puts a fresh set back. A pool longer than RP.seedCount
// (15) gives each player a random handful of it, so two characters seldom
// share the same set. Rows are [weight, text]; the text follows "emote ",
// with {he} {him} {his} for your pronouns.
//
//   general        any race, any normal class (never a dragon or elemental lord)
//   race[<Race>]   that race's body and habits, as GMCP names the race
//   class[<Class>] that class; dragons and elemental lords are classes here,
//                  and theirs is the whole voice of the form
//
// Rules for every seed (Ricardo, 2026-10-25): only what others can see (no
// "as if", nothing that tells the room what you think); nothing that invites
// a question (no reaction to something unseen); nothing that depends on the
// room or the moment; nothing that states something about you (hungry, cold);
// nothing rude or grating. Clumsy ones weigh 1, the rest 2.
if (!client.loom || !client.loom.roleplay) { if (!client.loom) client.loom = {}; client.loom.roleplay = {}; }
client.loom.roleplay.seedCount = 15;
client.loom.roleplay.seeds = {
  general: [
    [2, "glances around, taking quiet stock of the room."],
    [2, "watches the room for a while without saying anything."],
    [2, "follows the path of a passing insect with idle interest."],
    [2, "tilts {his} head, listening to something at the edge of hearing."],
    [2, "lets {his} gaze wander, then brings it back with a small shake of {his} head."],
    [2, "narrows {his} eyes at nothing in particular, then lets it go."],
    [2, "shifts {his} weight and settles into a more comfortable stance."],
    [2, "rolls {his} shoulders until something gives a small, satisfying pop."],
    [2, "stretches {his} arms overhead and lets them drop with a contented sigh."],
    [2, "flexes {his} fingers one at a time, working out a stiffness."],
    [2, "rubs at the back of {his} neck."],
    [2, "folds {his} arms and leans back a little."],
    [2, "lets {his} arms fall loose at {his} sides."],
    [2, "rocks back on {his} heels, then forward again, restless."],
    [2, "lets out a slow breath, {his} shoulders easing."],
    [2, "draws a deep breath and holds it a moment before letting it go."],
    [2, "sighs quietly, to no one in particular."],
    [2, "hums a few bars of some half-forgotten tune."],
    [2, "purses {his} lips, considering something."],
    [2, "drums {his} fingers idly against {his} side."],
    [2, "taps out a slow rhythm against {his} leg."],
    [2, "turns a small coin over and over between {his} fingers."],
    [2, "picks at a loose thread on {his} sleeve."],
    [2, "brushes a bit of dust from {his} clothes."],
    [2, "checks the fastenings of {his} pack with an absent tug."],
    [2, "pats at {his} pockets, making sure everything is still there."],
    [2, "straightens {his} clothes with a quick tug."],
    [2, "examines {his} fingernails for a moment."],
    [2, "rubs {his} hands together briskly."],
    [2, "scratches absently at {his} jaw."],
    [2, "stares into the middle distance, lost in thought."],
    [2, "raises an eyebrow, then lets it settle."],
    [1, "nearly trips over nothing, recovers, and pretends it never happened."],
    [1, "sneezes into {his} hand."],
    [1, "reaches for an itch between {his} shoulder blades, with mixed success."],
    [2, "swats at an insect only {he} seems to have noticed."],
    [2, "wipes {his} brow with the back of {his} hand."],
    [2, "clasps {his} hands loosely behind {his} back."],
    [2, "links {his} fingers together and stretches {his} arms out in front of {him}."],
    [2, "stretches one arm across {his} chest, then the other."],
    [2, "turns {his} head slowly from side to side, loosening {his} neck."],
    [2, "massages one wrist, then the other."],
    [2, "rubs {his} thumb slowly across the knuckles of {his} other hand."],
    [2, "presses {his} palms together and bends {his} fingers back gently."],
    [2, "tugs {his} sleeves back into place."],
    [2, "flicks a speck of lint from {his} shoulder."],
    [2, "adjusts the way {his} pack sits on {his} shoulders."],
    [2, "crouches briefly to adjust a strap, then straightens."],
    [2, "taps a finger lightly against {his} chin."],
    [2, "rests {his} hands on {his} hips."]
  ],
  race: {},
  "class": {}
};
