// roleplay_seeds -- the starting emotes, run by roleplay_setup. A list takes
// its seeds once, the first time it's in use, and is the player's after that;
// ROLEPLAY AEM RESET puts the seeds back. Rows are [weight, text]; the text
// follows "emote ", with {he} {him} {his} for your pronouns.
//
//   general       any race, any normal class (never a dragon or elemental lord)
//   race[<Race>]  that race's body and habits, as GMCP names the race
//   class[<Class>] that class; dragons and elemental lords are classes here,
//                 and theirs is the whole voice of the form
//
// Only a first general set for now: race and class seeds follow in batches.
if (!client.loom || !client.loom.roleplay) { if (!client.loom) client.loom = {}; client.loom.roleplay = {}; }
client.loom.roleplay.seeds = {
  general: [
    [3, "glances about, taking quiet stock of {his} surroundings."],
    [3, "lets out a slow breath, {his} shoulders easing a little."],
    [2, "pauses, as though some half-remembered thought had just caught up with {him}."],
    [2, "tilts {his} head, listening to something at the very edge of hearing."],
    [2, "rolls {his} shoulders, working out a stiffness that has crept in."],
    [3, "watches the comings and goings around {him} with mild interest."],
    [2, "hums a few bars of some half-forgotten tune under {his} breath."],
    [1, "stifles a yawn and blinks it away."],
    [2, "checks the fastenings of {his} pack with an absent tug."],
    [1, "smiles faintly at nothing in particular."]
  ],
  race: {},
  "class": {}
};
