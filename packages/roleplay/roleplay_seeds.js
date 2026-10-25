// roleplay_seeds -- the starting emotes, run by roleplay_setup. A list takes
// its seeds once, the first time it's in use, and is the player's after that;
// ROLEPLAY AEM RESET deals a fresh set. Each player gets a random handful of
// each pool (RP.seedPlan), so two characters seldom share the same set:
//   general  50 in the pool, 10 dealt, at the row's weight (2, clumsy ones 1)
//   race     20 per race,     5 dealt, weight 3
//   class    10 per class,    5 dealt, weight 4 (the class defines a character best)
// Twenty emotes in all for a normal class. Rows are [weight, text], or just
// the text where the plan sets the weight; the text follows "emote ", with
// {he} {him} {his} for your pronouns.
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
// Race pools assume no homeland, city or faith (any race lives anywhere):
// nature and the like belong in class pools.
if (!client.loom || !client.loom.roleplay) { if (!client.loom) client.loom = {}; client.loom.roleplay = {}; }
client.loom.roleplay.seedPlan = { general: { n: 10 }, race: { n: 5, w: 3 }, "class": { n: 5, w: 4 } };
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
  race: {
    // The plain human body and a traveller's habits: humans have no unusual features.
    Human: [
      "runs a hand back through {his} hair.",
      "tucks a loose strand of hair behind {his} ear.",
      "pushes {his} hair back from {his} forehead with the back of {his} wrist.",
      "rubs one eye with a knuckle.",
      "tugs lightly at an earlobe.",
      "rubs a thumb over the calluses on {his} palm.",
      "turns {his} hands over and looks at them for a moment.",
      "kneads the muscle at the base of {his} thumb.",
      "rubs {his} palms down the front of {his} legs.",
      "presses a hand to the small of {his} back and stretches.",
      "rises briefly onto {his} toes, then settles back down.",
      "stands with {his} weight on one leg, one hip cocked.",
      "kneads {his} shoulder with one hand.",
      "pushes {his} sleeves up to the elbow.",
      "hooks {his} thumbs into {his} belt.",
      "knocks the dust from {his} boots, one against the other.",
      "settles {his} clothes more comfortably about {his} shoulders.",
      "touches the pouch at {his} belt, then lets {his} hand fall.",
      "bites lightly at {his} lower lip.",
      "scuffs the toe of one boot against the ground."
    ],
    // Stocky and grounded, proud of their beards (many women dwarves remove theirs: easy to drop).
    "Dwarf": [
      "strokes {his} beard slowly from chin to tip.",
      "combs {his} fingers through {his} beard, working loose a tangle.",
      "tucks the end of {his} beard into {his} belt.",
      "smooths {his} beard down with both hands.",
      "plants {his} feet a little wider, settling {his} weight low.",
      "stands square and solid, like a boulder set in the ground.",
      "rolls {his} broad shoulders, slow and heavy.",
      "crosses {his} thick arms over {his} chest.",
      "flexes {his} heavy forearms.",
      "stamps one booted foot, then the other, firmly down.",
      "presses a heel into the ground, testing how firm it is.",
      "hitches up {his} belt with both hands.",
      "rubs the end of {his} nose with a thick finger.",
      "pushes a tangle of thick curls out of {his} eyes.",
      "checks the knots of {his} pack straps with a practised eye.",
      "turns a small pebble over in {his} fingers, studying the grain.",
      "inspects the stitching on {his} sleeve with a critical eye.",
      "hums a low, rumbling work song under {his} breath.",
      "drums {his} thick fingers on {his} belt buckle.",
      "gives a short, decisive nod."
    ],
    // Slim, sinewy and light on their feet; dark eyes, watchful stillness (no light assumed).
    "Mhun": [
      "shifts {his} weight onto the balls of {his} feet.",
      "tests {his} footing with a light, quick step.",
      "moves with a soft, restless step, then stills again.",
      "flexes {his} long, wiry fingers.",
      "rolls {his} lean shoulders with a quick, loose shrug.",
      "stretches {his} wiry frame, joints loose and easy.",
      "rubs a thumb along {his} sharp jaw.",
      "sweeps the hair back from {his} angular face.",
      "blinks slowly, {his} dark eyes giving nothing away.",
      "glances upward, studying the space overhead.",
      "stands very still, only {his} eyes moving.",
      "tucks {his} chin down, watching from under {his} brows.",
      "slips {his} hands into {his} sleeves.",
      "picks absently at the grit under {his} fingernails.",
      "bounces lightly on the balls of {his} feet.",
      "shakes out {his} hands and wrists, loose and quick.",
      "steps lightly to one side and back again, without a sound.",
      "balances easily on one foot, the other ankle hooked behind it.",
      "smooths {his} dark hair flat with one palm.",
      "tilts {his} head, {his} dark eyes half-lidded."
    ],
    // Winged humans: grooming, folding and stretching the wings; never airborne.
    "Atavian": [
      "runs a hand along the edge of one wing, smoothing the feathers.",
      "preens a stray feather back into place.",
      "smooths the feathers at the base of {his} wings with careful fingers.",
      "combs {his} fingers through the long flight feathers of one wing.",
      "turns to check a ruffled patch of feathers over {his} shoulder.",
      "plucks a loose feather from {his} wing and lets it drift down.",
      "reaches back to straighten a bent feather.",
      "shakes out {his} wings, then folds them neatly against {his} back.",
      "tucks {his} wings in a little tighter.",
      "resettles {his} wings with a soft rustle of feathers.",
      "ruffles {his} feathers briefly, then lets them settle.",
      "lets {his} wings droop loosely behind {him}.",
      "stretches one wing out to its full length, then the other.",
      "half-spreads {his} wings, then draws them back in.",
      "rolls {his} shoulders, the movement rippling down through {his} wings.",
      "gives {his} wings a single slow beat, stirring the air around {him}.",
      "flicks the tips of {his} wings, shaking off a little dust.",
      "holds {his} wings a little apart, balanced lightly on {his} feet.",
      "shifts {his} wings to keep them clear of {his} surroundings.",
      "scratches at an itch where {his} wings meet {his} back."
    ],
    // Lithe, elegant and unhurried, long hair. No forest: that belongs to classes (Tsol'aa live in every city).
    "Tsol'aa": [
      "gathers {his} long hair over one shoulder.",
      "combs {his} fingers slowly through the length of {his} hair.",
      "tucks a long strand of hair back with an unhurried hand.",
      "stands in a quiet, lithe stillness, {his} weight perfectly balanced.",
      "moves with slow, deliberate grace, then settles again.",
      "stretches {his} lithe frame with slow, easy grace.",
      "inclines {his} head slightly, a slow and measured movement.",
      "waits, perfectly patient, without a trace of hurry.",
      "regards the room with a long, patient look.",
      "blinks slowly, {his} gaze steady and calm.",
      "folds {his} slender hands together before {him}.",
      "smooths a crease from {his} clothes with long, elegant fingers.",
      "runs a fingertip along the curve of {his} ear.",
      "draws {his} long hair back from {his} face with both hands.",
      "smooths {his} long hair down over {his} back.",
      "straightens with quiet poise, chin lifted slightly.",
      "lowers {his} eyes for a long moment, then raises them again.",
      "lets {his} hands rest lightly at {his} sides, perfectly still.",
      "rests a fingertip against {his} lips for a moment.",
      "shifts {his} weight with light, easy balance."
    ],
    // Tiger-like: tail, whiskers, fur and mane, feline ears, the great cat's ease.
    "Rajamala": [
      "flicks the tip of {his} tail lazily.",
      "curls {his} tail around {his} legs.",
      "lets {his} tail sway slowly from side to side.",
      "lashes {his} tail once, then stills it.",
      "smooths the fur along {his} tail with one hand.",
      "twitches {his} whiskers.",
      "smooths {his} whiskers back with the side of a finger.",
      "lifts {his} nose and scents the air, whiskers twitching.",
      "licks the back of {his} hand and smooths down a ruffled patch of fur.",
      "ruffles the fur at {his} neck, then smooths it flat.",
      "gives a full-body shake that ripples through {his} fur.",
      "flicks one ear, then the other.",
      "flattens {his} ears briefly, then lets them rise.",
      "arches {his} back in a long, slow stretch.",
      "flexes {his} fingers, spreading them wide, then curls them in again.",
      "rolls {his} powerful shoulders, muscles shifting beneath {his} coat.",
      "pads a slow step on broad, silent feet.",
      "settles into a loose stillness, only {his} tail moving.",
      "rumbles softly, deep in {his} chest.",
      "kneads the air briefly with flexing fingers."
    ],
    // Horns, hooves and goat legs, shaped beards; jovial through movement and tunes, not smiles.
    "Satyr": [
      "runs a hand over the curve of one horn.",
      "traces the ridges of one horn with a fingertip.",
      "scratches at the base of {his} horns.",
      "tips {his} head to one side, horns and all.",
      "taps a cloven hoof against the ground in a quick little rhythm.",
      "stamps one hoof, then the other.",
      "shifts from hoof to hoof with a soft clatter.",
      "kicks out one goat leg in a lazy stretch.",
      "scratches the coarse fur of one leg with the other hoof.",
      "brushes a few tangles out of the coarse fur on {his} legs.",
      "balances on one hoof, then the other.",
      "strokes {his} carefully shaped beard.",
      "twirls the end of {his} beard around a finger.",
      "smooths {his} beard into a neat point.",
      "does a light, skipping half-step, hooves clicking.",
      "whistles a few bright notes of a jaunty tune.",
      "hums a lively tune, tapping a hoof in time.",
      "leans back with an easy, careless air.",
      "claps {his} hands together once, briskly.",
      "rubs {his} palms together, then dusts them off."
    ],
    // Dignified boar-folk: crystals at joints and skull, snout and tusks, sturdy, earth-minded. No homeworld.
    "Tash'la": [
      "runs a thumb along the crystals ridging {his} knuckles.",
      "brushes grit from the crystals along {his} forearm.",
      "rubs the crystals at {his} elbow with the heel of {his} hand.",
      "flexes {his} hand, the crystals at {his} knuckles grinding faintly together.",
      "rolls {his} shoulders, crystals clicking softly at the joints.",
      "picks a fleck of dirt from between the crystals on {his} wrist.",
      "snorts softly through {his} broad snout.",
      "lifts {his} snout and scents the air.",
      "rubs the side of {his} snout with the back of a hand.",
      "runs a thumb along one tusk.",
      "grunts low in {his} throat.",
      "stands squarely, head held with quiet dignity.",
      "squares {his} broad shoulders and lifts {his} chin.",
      "shifts {his} considerable weight from one foot to the other.",
      "folds {his} thick arms, perfectly still.",
      "rolls {his} thick neck slowly from side to side.",
      "presses a heel down, testing the ground beneath.",
      "turns a small stone over in {his} thick fingers.",
      "brushes soil from beneath {his} fingernails.",
      "scrapes a thumbnail along a seam in a stone, studying it."
    ]
  },
  "class": {}
};
