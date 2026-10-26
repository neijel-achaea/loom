# Regression checklist

One pass through everything Loom does, in game. Run it before a release, and whenever a change touches several packages. It was built from the in-game checklists of every merged pull request up to the 1.0 candidate (#139), with duplicates, version checks and behaviour that has since changed taken out.

## How to run it

- **Copy this page** into a new issue titled "Regression run: <version>", so each box can be ticked there.
- **Use the release candidate**: every package from `dist/` on the branch or tag being tested.
- **Each failure becomes a bug** in the current milestone, linked from the run's issue. Note the package, the step and what happened.
- **Characters:** at least one main (with dragonform if you have it), and an alt of another class. Sections marked *(alt)* want a second character; *(party)* a second player.
- **Keep it current:** when a pull request adds an in-game checklist, add its lasting steps here in the same PR. The per-class rows in section 3 are generated from hunting's class files by `tools/docs.py`: change the class file, not the rows.

## 1. Install and load

- [ ] **Fresh profile, one package:** import it alone. No errors, its install notice shows, `LOOM` isn't needed for it to work, its `HELP` prints. Repeat for each package (or a sample of five, including one with a tab).
- [ ] **Everything:** import every package. `LOOM` lists them all with versions and commands; `LOOM LINKS` lists every link as on.
- [ ] **The basher without hunting:** an orange notice says hunting is needed; nothing is sent.
- [ ] **Reimport over itself:** reimport any package without reloading. Its settings stay, no duplicate timers (no doubled notices).
- [ ] **Upgrade:** import the previous release, change a few settings in several packages, then import the candidate over it. Nothing reset.
- [ ] **Page reload:** every tab redraws; toggles that should load off (basher, harvesting, gathering) are off.
- [ ] **`LOOM UPDATES`:** lists what's out of date ("up to date" in lime otherwise). At login on a current profile: nothing. `LOOM UPDATES AUTO OFF`, relog: no check.
- [ ] **Uninstall:** uninstall a package another one shows (social): `LOOM` drops it at once, and Here loses its name colours without a reload. Reinstall: the colours are back.
- [ ] **Retired packages:** with one of Loom's retired packages still installed (crystalism, artificing, elementalism), `LOOM` names it in orange; uninstall it and the line goes without a reload. Your own packages that aren't Loom's: no line, and nothing at the login check.

## 2. Every package

For each package:

- [ ] `<PACKAGE> HELP`: a monospace table, columns aligned, `<…>` visible.
- [ ] Bare `<PACKAGE>` and `<PACKAGE> STATUS`: the same status, in cyan.
- [ ] A typo'd subcommand: orange, pointing to HELP.
- [ ] A setting changed: lime.
- [ ] `<PACKAGE> DEBUG`: its internal state, in cyan.
- [ ] A command that throws away recorded data (`WIPE`, `CLEAR`, `DISCARD`, `FORGET`): without `CONFIRM` it says what would be lost, in orange; with it, done.
- [ ] `<PACKAGE> RESET` (where it exists): working state rebuilt, the player's records kept. The old spelling `REBUILD` (coffers, standings, ledger, dmgchart) still works and says it's now `RESET`.
- [ ] Its tab (if any): the panel colour reaches the bottom of the tab, also after resizing it; the icon shows after a reload.

And for the suite:

- [ ] `LOOM PAUSE ON`: nothing is sent by any package (walk with harvesting, patrolling and sigils on; fish; hunt with the basher primed). `LOOM PAUSE OFF`: all resume.
- [ ] Sleep and meditate: Loom pauses on its own and resumes when you wake or finish.
- [ ] `QUIT` mid-hunt: the hunt is filed, herbs go to the rift, gold to the backpack, then you quit.
- [ ] **Themes:** at login the tabs take your city's theme (`LOOM THEME` says which and why). `LOOM THEME MHALDOR`, then `CYRENE`: every open tab changes at once, whole background included; targets, afflictions, plant, standing and group colours read the same in each. `LOOM THEME OFF`: each tab's own colours; `AUTO`: your city's. A cityless character: `LOOM THEME` says so.
- [ ] **`LOOM PERF`:** `LOOM PERF DATA` prints sizes per package at once; `LOOM PERF 60` while hunting or walking prints its report by itself, with package names and trigger patterns; `LOOM PERF 30` then `STOP` prints early, and nothing feels different afterwards.

## 3. Hunting

- [ ] `HUNTING` shows your class, main attack, dragon mode and autogold. On a class with no layout: generic keys and "(not configured yet)".
- [ ] F1 lights on balance and equilibrium; a rage key lights only when ready (off cooldown, global cooldown clear, enough rage).
- [ ] Using a rage ability: its line is tagged (`[WINDLASH]`), its key and the others go dark (global cooldown); they relight on "You can use another Battlerage ability again" and "You can use Windlash again".
- [ ] Using the shieldbreak: tagged, and the other rage keys you can afford **stay lit**. On an unshielded mob: `[NO SHIELD]`.
- [ ] `HUNTING MAIN` lists the main attacks; switching one changes F1 and survives a reload. `HUNTING MAIN TEST = say hello` adds one; `HUNTING MAIN TEST =` removes it.
- [ ] Criticals highlighted by tier; your own only.
- [ ] `HUNTING AUTOGOLD ON`: gold from your kill is picked up (into the backpack with security); someone else's kill: left. `ALL`: anyone's. `OFF`: none.
- [ ] Change class or form: keys and rage costs switch; `HUNTING RAGE` shows only the new class's abilities, cooldowns empty.
- [ ] *Dragon:* F8 cycles PHY → MAG → AUTO; in AUTO, F1 flips between Gut and Incantation as endurance and willpower drain. `HUNTING AFTERFORM DEFCON INIT`, then dragonform: nothing is sent during the transformation (triggers paused, elder dragons too), init after the roar and after it melts.
- [ ] *Dragon:* use a rage ability, shift form, shift back: the rage keys light again (the shared cooldown never stays stuck), and the basher fires rage.
- [ ] Toggles (Sneak, Weave, Block): the key reads ON/OFF without lighting; typed by hand, the key follows; reload: OFF.
- [ ] `HUNTING HIGHLIGHT OFF`: every key goes dark at once and stays dark (rage, F1, the basher's STOP); the basher still fires rage. `ON`: keys light again. Survives a reload.
- [ ] F8–F12 need Button Count 12; the install notice and `HUNTING HELP` say so.

### Every class

For each class you can play (one row each; the ones you can't, skip): F1 attacks and is tagged; each rage ability is tagged, goes dark after use and relights on its "You can use X again"; the shieldbreak works on a shielded mob; F11 and toggles do what their label says.

<!-- Generated from hunting's class files by tools/docs.py; edit the class file, not these rows. -->
<!-- loom:classes all -->
- [ ] **Alchemist**: F1 Iron; rage: Miasma, Magnesium, Pathogen, Cadmium, Hypnotic, Provoke; shieldbreak: Caustic (on a shielded mob); F11: Tin
- [ ] **Apostate**: F1 Bleed; rage: Convulsions, Burrow, Bloodlet, Possess, Horrify, Provoke; shieldbreak: Pierce (on a shielded mob); F11: Horrify; toggle: Sneak
- [ ] **Bard**: F1 Jab; rage: Moulinet, Howlslash, Cyclone, Trill, Charm, Provoke; shieldbreak: Resonance (on a shielded mob)
- [ ] **Black Dragon**: F1 Gut or Incantation, by the F8 mode; rage: Dragonspit, Dragonsting, Override, Corrode, Dragonfear, Provoke; shieldbreak: Dissolve (on a shielded mob); F11: Dragonheal
- [ ] **Blademaster**: F1 Drawslash, Multislash; rage: Leapstrike, Spinslash, Headstrike, Daze, Nerveslash, Provoke; shieldbreak: Shatter (on a shielded mob)
- [ ] **Blue Dragon**: F1 Gut or Incantation, by the F8 mode; rage: Dragonchill, Glaciate, Frostwave, Ague, Override; shieldbreak: Frostrive (on a shielded mob); F11: Dragonheal
- [ ] **Depthswalker**: F1 Cull; rage: Drain, Lash, Erasure, Curse, Boinad, Provoke; shieldbreak: Nakail (on a shielded mob); F11: Kail
- [ ] **Druid**: F1 Maul; rage: Strangle, Redeem, Ravage, Sear, Glare; shieldbreak: Vinecrack (on a shielded mob); F11: Barrier
- [ ] **Gold Dragon**: F1 Gut or Incantation, by the F8 mode; rage: Overwhelm, Deaden, Psiblast, Psistorm, Psidaze; shieldbreak: Psishatter (on a shielded mob); F11: Dragonheal
- [ ] **Green Dragon**: F1 Gut or Incantation, by the F8 mode; rage: Dragonspit, Scour, Override, Slaver, Dragonsap; shieldbreak: Deteriorate (on a shielded mob); F11: Dragonheal
- [ ] **Infernal**: F1 by weapon specialisation; rage: Ravage, Spike, Hellstrike, Deathlink, Soulshield, Provoke; shieldbreak: Shiver (on a shielded mob); F11: Soulshield
- [ ] **Jester**: F1 Bop; rage: Noogie, Ensconce, Befuddle, Dustthrow, Rap, Provoke; shieldbreak: Jacks (on a shielded mob); F11: Fool
- [ ] **Magi**: F1 Staff; rage: Windlash, Dilation, Squeeze, Firefall, Stormbolt; shieldbreak: Disintegrate (on a shielded mob); F11: Reflection
- [ ] **Monk**: F1 Combo; rage: Spinningbackfist, Tornadokick, Mindblast, Scramble, Ripplestrike, Provoke; shieldbreak: Splinterkick (on a shielded mob); F11: Block toggle
- [ ] **Occultist**: F1 Warp; rage: Harry, Chaosgate, Fluctuate, Temperance, Stagnate, Provoke; shieldbreak: Ruin (on a shielded mob); F11: Simulacrum; toggle: Sneak
- [ ] **Paladin**: F1 Doubleslash; rage: Harrow, Shock, Punishment, Recovery, Provoke, Regeneration; shieldbreak: Faithrend (on a shielded mob); F11: Regeneration
- [ ] **Pariah**: F1 Wrack; rage: Boil, Feast, Spider, Wail, Symphony, Provoke; shieldbreak: Scour (on a shielded mob); F11: Symphony
- [ ] **Priest**: F1 Smite; rage: Torment, Desolation, Hammer, Incense, Horrify, Provoke; shieldbreak: Crack (on a shielded mob); F11: Horrify
- [ ] **Psion**: F1 Overhand; rage: Barbedblade, Devastate, Whirlwind, Regrowth, Terror, Provoke; shieldbreak: Pulverise (on a shielded mob); F11: Indomitability
- [ ] **Red Dragon**: F1 Gut or Incantation, by the F8 mode; rage: Overwhelm, Dragontaunt, Dragonblaze, Flamebath, Scorch; shieldbreak: Melt (on a shielded mob); F11: Dragonheal
- [ ] **Runewarden**: F1 by weapon specialisation; rage: Collide, Onslaught, Etch, Safeguard, Bulwark, Provoke; shieldbreak: Fragment (on a shielded mob); F11: Bulwark
- [ ] **Sentinel**: F1 Doublestrike, Bite, Claw, Maul; rage: Pester, Skewer, Swarm, Tame, Goad, Provoke; shieldbreak: Bore (on a shielded mob)
- [ ] **Serpent**: F1 Garrote; rage: Thrash, Throatrip, Snare, Flagellate, Obliviate, Provoke; shieldbreak: Excoriate (on a shielded mob); F11: Weave toggle; toggle: Sneak
- [ ] **Shaman**: F1 Bleed; rage: Corruption, Haemorrhage, Vurus, Cesaret, Korkma, Provoke; shieldbreak: Vulnerability (on a shielded mob); F11: Korkma
- [ ] **Silver Dragon**: F1 Gut or Incantation, by the F8 mode; rage: Overwhelm, Sizzle, Dragonspark, Stormflare, Galvanize; shieldbreak: Splinter (on a shielded mob); F11: Dragonheal
- [ ] **Sylvan**: F1 Thornrend; rage: Torrent, Sandstorm, Stonevine, Leechroot, Rockshot; shieldbreak: Thornpierce (on a shielded mob); F11: Reflection
- [ ] **Unnamable**: F1 Doublewhirl; rage: Shriek, Destroy, Onslaught, Entropy, Dread, Provoke; shieldbreak: Sunder (on a shielded mob); F11: Dread
<!-- /loom:classes -->

## 4. Basher

- [ ] `BASHER`: OFF, with your class's main attack. `BASHER ON`: primed, the curing reminder once, nothing sent until you attack.
- [ ] Your first attack starts the run (lime). One attack per recovery, no double sends.
- [ ] Several mobs of the same name (no kill order in the area): it carries on until none is left, then "run over, still primed". Attack in the next room: starts again.
- [ ] Target a player by name: nothing sent.
- [ ] `BASHER STOP` mid-fight: stops at once.
- [ ] **F1:** primed, F1 is unchanged; once a run starts, F1 is a lit STOP key. Pressing it ends the run, the basher stays primed and F1 is the main attack again; the next attack starts a new run. A run that ends by itself (room cleared, wimpy): F1 back too.
- [ ] Three attacks that took no balance: it switches itself off.
- [ ] Venom confusion: one `DIAGNOSE` on the next recovery.
- [ ] **Rage:** `BASHER RAGE` shows the order (Blue Dragon: Ague > Override > Dragonchill > Frostwave, keeping Override); during a run abilities go out on their own, one per global cooldown, without delaying the main attack. `BASHER RAGE OFF` stops it; the keys still light.
- [ ] **Shields:** a shield holds attacks; with the rage, the shieldbreak goes out at once ("shield razed") and attacks resume; without it, the notice says what's missing. No double raze. *Dragon:* Blast on recovery while dragonbreath is up; without breath, "no dragonbreath" and it waits.
- [ ] **Wimpy:** `BASHER WIMPY` shows 40% health / 20% mana. Drop below in a run: one step back the way you came, "fled", still primed. After a login (no way back) and no `WIMPY DIR`: it says so and doesn't move.
- [ ] **Interruptions:** another player walks in, a tell to you, or your city channel names you, mid-run: orange notice, the current mob dies, nothing new starts. Your own tells and city lines change nothing. An enemy (with social): named as one. Starting with people already there: normal run. `BASHER INTERRUPT OFF`: arrivals and tells don't end the run, `BASHER` says interruptions are off, and it's kept after a reimport; `ON` brings them back.
- [ ] **Kill order:** in a new area its mob types join IGNORED with NEW. Make two ACTIVE and reorder them: Here's badges follow at once. Primed: your target jumps to the top mob when mobs arrive or die; a target you pick stays until the queue changes; no "Your target is now" spam. A run goes through the active mobs in order and stops when only ignored ones are left.

## 5. Defences: DEFCON and Self

- [ ] `DEFCON`: your level (or "5, not applied yet") and class. `DEFCON LIST` by tier, your changes marked `*`.
- [ ] `DEFCON 4` then `DEFCON 3`: only the difference is sent, priority lines hidden. `DEFCON 3` again: full resync.
- [ ] Each class and dragonform keep their own level; switching form says which level applies.
- [ ] Log in: `DEFCON INIT` runs once by itself (`DEFCON INIT AUTO OFF`, relog: nothing). Init order: common commands first, the class's after; a morph's follow-ups after the morph.
- [ ] `DEFCON ADD` a defence at a kept tier: priority set at once. `REMOVE` a default: reset; `RESET` it: back. Relog: changes kept. `DEFCON EXPORT` prints a readable table.
- [ ] Insomnia cleared: raised again (not while paused). Choking underwater: pear from the rift.
- [ ] **Self tab:** name, class, level, afflictions and defences fill after `DIAG` and `DEF`; ranks after `SCORE`. One background all the way down, also while resizing; Condition in three columns; ranks stay aligned with or without a ▲/▼.
- [ ] Lose a watched (`SELF WANT`) defence: announced and red; struck through for two minutes. Each class has its own `SELF WANTS`.
- [ ] `SELF KEEP` an affliction: gone from the row and the count.
- [ ] Venom confusion: yellow "diag" chip until `DIAG`.
- [ ] Explorer or XP rank moves: green ▲ / red ▼ against the page load; a new character shows `-` until its first rank.
- [ ] *With DEFCON:* the Defences heading names the level; missing DEFCON defences amber, `SELF WANT` ones red; a stripped DEFCON defence raises no notice. Change level: the watched set follows.

## 6. Room, people and talk

- [ ] **Here:** moving fills the name, with area and environment on the line under it, tags, exits, number, description (folded; click unfolds and it stays so; `ROOM DESC OPEN`). With `BASHER ON`, its chip sits top right, in short and long room names alike.
- [ ] **Remember a room:** REMEMBER in Here's title, walk a few rooms, GO BACK: `PATH FIND` walks you back, "back in …" on arrival, and the button reads REMEMBER again. Reload with a room remembered: still GO BACK. In the remembered room: "remembered"; a click forgets it.
- [ ] Players come and go (yourself left out), full title on hover; flying up leaves, landing joins.
- [ ] Mobs one row each in the room's order; a corpse greyed; picking something up removes it; items merged with a count; fixtures (shrines, benches, monoliths) before things you can take.
- [ ] **Loyals:** stand 3 seconds in a room with someone's loyal: no probe text and no notice show, Here shows ♞ and (owner), group-coloured if social knows them; your own loyal is green with no owner. Rooms of ordinary mobs: nothing shows, no line goes missing (`ROOM PROBE DEBUG`: ended by holding or prompt, not timeout). With sigils, harvesting or patrolling on, their answers all show and loyals are still marked. `ROOM PROBE` lists the loyals; `ROOM PROBE OFF` stops probing. Reload the page and walk back in: the knight shows at once, with no probe; `ROOM PROBE FORGET` asks for CONFIRM, then the next visit probes again. `ROOM PROBE IGNORE Qurnok` in Qurnok: the knights' marks go at once; `UNIGNORE` brings them back; a real player's loyal is still marked.
- [ ] **Nothing lost to a probe:** walk quickly, and follow someone, through rooms where new mobs appear: nothing is probed in rooms you pass through, every room's title and description show, and no probe answer ("What do you wish to examine?") shows; in a room where mobs attack on arrival, nothing is probed while you're being hit; someone saying something or sending a tell while you move: shown. `ROOM PROBE DEBUG` after a probe lists only the mob's own lines.
- [ ] Targeting (click, `ST`, an alias, `tar`): the right mob glows with its health, at once; after it dies the glow moves to the next row. Target a player: red glow; `ST RAT` afterwards moves it to a rat.
- [ ] A small room fills the whole tab.
- [ ] Newbies (Uaithne, Ithin, Tuqad): green leaf, title on hover. `CWHO` teaches the list.
- [ ] **Social:** names coloured in every line, your own in yellow. `SOCIAL ADD friends <someone in the room>`: colour changes at once. `SOCIAL LIST`, `DEL`.
- [ ] Watched people logging in and out: "has awoken" / "has drifted into slumber". No `QW` output in the main window, even lagged, and no "(N total)." line when nobody is hidden.
- [ ] `SOCIAL POLL EVERY 15`: Online's "last poll" moves every 15 s, kept after a reimport; `EVERY 2` refused; `EVERY 5` back to the default.
- [ ] `SOCIAL CLEAR friends` warns with the count; `SOCIAL CLEAR friends CONFIRM` empties it, Online updates.
- [ ] `CITY ENEMIES`: "city enemies loaded n / n". `SOCIAL SYNC OFF` (kept after a reload), `CITY ENEMIES`: no notice, enemies group unchanged; `SYNC ON` loads it again.
- [ ] **Online tab:** watched people online with colours and "online for"; arrivals glow, departures grey then go; OFFLINE with "last seen" (survives a reload), folds on click or `SOCIAL OFFLINE OFF`. `WATCH`/`UNWATCH` updates it at once.
- [ ] **Comms:** says, tells both ways, party, clan and city lines in All, in the same colours as the main window, tagged; date and time on hover; names of people in social's groups coloured anywhere in a line; unread counts on filters, cleared on viewing; Tells newest first, click opens the conversation; click a name → `t <name> `; mute from the tab and `COMMS MUTE`, kept after a reload; header stays at the top.
- [ ] **Comms filters:** Say, Tell, Party, Yell, Shout, City, House, HNT, Clans, then the rest alphabetically. Your clans under **Clans** with one badge; a tag opens one clan, ← clans returns; mute one clan. Emotes, deathsight and partycomms' `[PARTY]` reports never appear (not in All, not counted on Party); ordinary party talk does.
- [ ] **Comms scrolling:** through a busy stretch (well past 200 lines) All stays on the newest line, no jumping. Scroll up to read: the tab stays put while lines come in. Back at the bottom: it follows again. After a reload it opens at the newest lines; switching views starts at the newest.
- [ ] `COMMS CLEAR` asks; `COMMS CLEAR <channel> CONFIRM` clears that channel only.
- [ ] **Standings:** a nudge and `UNDO`; `STANDINGS <name>` shows history, tags, social chips; `SET`; `TAG` and `@tag`; `REVIEW`, `OK`, `SKIP`.
- [ ] **Vision:** a city member in alertness range: line hidden (`VISION HIDE OFF` shows it); an enemy: line coloured, party alert on the set channel.
- [ ] **PartyComms** *(party)*: `PARTYCOMMS TEST` shows two chips with levels, `CLEAR` removes them; `PARTYCOMMS` says "as Name (Class level)" (after a `SCORE` or a relog); in a party, chips for each member with class, level, bars, rage and target (green when shared); no reports or IH lines in the main window; leaving the party switches sharing off with a notice.

## 7. Hunting records

- [ ] **Huntstats:** hunt a few minutes: `HUNTSTATS` shows the area, rates, kills, next level, Dragonhood (not on a dragon). The Stats tab's top shows the hunt under way, updating after each kill.
- [ ] Refresh mid-hunt: "resumed hunt in …". Leave the area: filed with a notice; in `HUNTSTATS LOG`, `AREAS` and the tab.
- [ ] A visit under a minute: nothing filed.
- [ ] `HUNTSTATS SUGGEST`: ten areas; one just hunted says "last today". `SUGGEST WEIGHTS 50 50 0` reorders and survives a reload.
- [ ] *(party)* `PARTY ADD`; people walking through aren't listed; `SPLIT` mid-hunt and at the end; a bystander picking up gold changes nothing; `SPLIT REPORT` reaches party tell; `SPLIT TELL ON` sends it at the end.
- [ ] **DmgChart:** a fight fills both donuts and the rates; crits in the right tier rows (a party member's not counted); bleeding is its own slice and doesn't keep the fight going; a new denizen starts a new fight.
- [ ] Health lasts appears while health falls (after a couple of hits), lengthens on a sip, absent in an easy fight. Below 10 s: one orange warning; recover and drop again: a second one. `DMGCHART WARN 15` / `OFF`, kept after a reload.
- [ ] `DMGCHART START test`, fights, `END`: saved; `LIST`, `SHOW <n>`, `LIVE`. A reload mid-recording resumes it; `DMGCHART RESET` mid-recording clears the live fight and the recording carries on.
- [ ] **LevelGraph:** `LEVELGRAPH` level with decimals and rates, the session (since when, how long) and the time to the next level; the minute graph moves once a minute; `GRAPH LONG OFF`/`ON`, `SIZE 140`.
- [ ] Sessions: the Level tab's "This session" counts from your first prompt; `LEVELGRAPH NEW` restarts it; more than 30 minutes logged off starts a new one at login; `LEVELGRAPH GAP 60` kept after a reload.

## 8. Money, items and calendar

- [ ] **Coffers:** "the books are open" within a prompt or two of login. Deposit/withdraw: no change to the session. Pick up or spend: counted. Big gain: lime "Ka-ching"; big loss: orange.
- [ ] `COFFERS SESSIONS`, `DAYS`, `CSV`; `GOAL 10k` and its bar; `WIPE` warns; `WIPE CONFIRM` clears books, goal and proposals.
- [ ] Proposals: accepted while a goal is under way, it adds to that goal (earned so far kept, both sources in the tab); with the goal reached, a fresh goal from now; `COFFERS GOAL 50k` replaces whatever goal there was.
- [ ] **Ledger:** the digest prints at login, `DATE` lines hidden; dates read "12th Valnuary". `LEDGER ADD test @ +1 days`, `DONE`; a repeating one moves to its next date; `DROP`; `TOUCH` a standing item. An item another package adds right after login reads "fresh" once the date is known (never "untouched 12280mo").
- [ ] **TalPieces:** a found piece counted and highlighted; listing your pieces reads every page and rebuilds the tab, combines queued (`COMBINE OFF`: none); `NEED` and `RATE` agree with the tab.
- [ ] **Vials:** `VIALS LEARN` hides the table and sets the vials with sips; `VIALS REFILL <elixir>` fills the right one; `ELIXLIST` typed by hand still shows.
- [ ] **Security:** antitheft on, remove a watched item: put back with the red warning. `GG 500`: you get 500, nothing put back, no warning, `SECURITY` still says antitheft ON; `GG`: everything; `PG` puts it back. Gold taken out by hand (`get 10 sovereign from <pack>`): put back with the red warning. With selfishness up, `GIVE` something: selfishness drops and comes back. Autogold fills the backpack.

## 9. Gathering and the city

- [ ] **Fishing:** `CL <direction>` baits and casts; nibble → tease, strike → jerk, hooked → reel, stages marked [1/4]–[4/4]; a new yearly record tells the party "Ding fish!". `FISHING BAIT` changes the bait. It never casts again by itself. Bait turning to dust is hidden.
- [ ] **Fishing bait:** with a bare hook, `CL` baits, then casts once balance is back (no "must regain balance"). After reeling in by hand, `CL` throws no bait away. `FISHING REBAIT ON`: every way a catch ends, and a snapped line, re-baits on balance with a notice, and the next `CL` only casts; `OFF`: CL baits every cast. No pole wielded: the game's complaint makes it wield one.
- [ ] **FishingStats:** your casts, hooks and catches under your name, others' under theirs; the area follows the game; `RANKINGS FISHING` read and a record catch flagged; a session files itself after the gap.
- [ ] **Harvesting:** walk a forest with `HARVESTING ON`: harvests and stores only what's short; rift totals update, and go down when you take plants out (`OUTR 1 <plant>`, then `HARVESTING`); `HARVESTING MIN 500` shrinks the list; reload: stays as left.
- [ ] **Gathering:** `GATHERING ON` reads `IR INGREDIENTS` hidden; walk a jungle, garden, grasslands, valley, forest, underground and river room: only what's short is gathered and stored (seeds and clay's gold flakes too); a room with herbs and materials harvests first, then gathers, never both at once; a failed gather moves on at the next prompt; `GATHERING MIN olive 1000`; reload: off.
- [ ] **Patrolling:** `PATROLLING ON`, walk: one notice per room and nothing of `PLANTS` shows (a road: one notice too); no shrine notices (shrines show in Here); `SUGGEST`, `STAMP`; replanting logged to the clan with the date.
- [ ] **Sigils:** `SIGILS WATCH ON` in your city: low monoliths flagged with their months, a missing one "no monolith"; walking back in doesn't repeat it; `SIGILS REPORT` with costs; `IGNORE HERE` silences a room; `CLEAR` asks, `CLEAR CONFIRM` empties the flagged list.
- [ ] **Sigils with Here's probes:** walk briskly through rooms where mobs come and go, with watching on: no "no monolith" for a room that has one (the monolith answer would show after it); `SIGILS DEBUG` shows a probe waiting on room, then sent at the next prompt.
- [ ] **Magi (crystals):** `MAGI REFINE 10`: plan line, a REFINE every 1.5 s, rift put away at the end; `REFINE STOP` mid-run; a pearl from a corpse picked up; with `PORTAL ON`, a city member's "Gate." gets a portal, someone else the polite no; attuning pauses Loom until the crystal calls.
- [ ] **Conjuration:** `CONJURATION FLAME`: no "must regain balance" spam, the sigil ends in your inventory; `CONJURATION` shows progress; `STOP` abandons.
- [ ] **Civic:** `CIVIC AIDE ON`/`OFF` sends the duty commands and the clan line; `CIVIC GREET <name>` (and `CT`/`CLT`); a lesson request accepted (not from an enemy); a new citizen escaping is added to social's city group.
- [ ] **Magi (staff and treaties):** `MAGI STAFF FROST`: the staff key casts horripilation after the next prompt; a treaty pauses and resumes with sipping back on.
- [ ] **Magi (upgrade):** a flooded room's line is highlighted cyan; with crystalism or artificing still installed, the warning at load and no pearl picked up twice; after uninstalling them and reloading, `MAGI` shows the old settings.
- [ ] **Numpad movement:** walk on the number pad; 5 goes up, 0 down.
- [ ] **Roleplay:** after login `ROLEPLAY` names your race, class and pronouns; `ROLEPLAY AEM LIST` shows general + race + class with chances adding to 100%. `AEM ADD CLASS 5 <text>`, `EDIT`, `WEIGHT`, `TEST`, `REMOVE` by LIST number. `AEM TIME 1 2` and `AEM ON`: an emote within two minutes, never the same twice running. Hidden (`HIDE` or a shroud), asleep, or just hit: nothing sent, `ROLEPLAY AEM` says what holds it. Say something: the next one a minute later. In dragonform, `LIST` shows only the dragon's list. Reload: AEM is OFF, lists and settings kept.

## 10. Integrations

With every package installed, each link does its part, and switching it off (`LOOM LINK <id> OFF`) removes exactly that part and nothing else; `ON` brings it back.

- [ ] `social-room`: players in Here in group colours, group on hover. Off: plain names in Here, Comms unaffected.
- [ ] `social-comms`: talkers, Tells and the conversation header coloured. Off: game colours, Here unaffected.
- [ ] `standings-online`: band icon column in Online, arrow after a recent nudge, details on hover.
- [ ] `standings-comms`: standing on hover in Comms only.
- [ ] `standings-login`: "Ana ♥ has awoken."
- [ ] `standings-social`: with `SOCIAL COLOURS STANDINGS`, band colours everywhere; people not on the books plain. A nudge across a band changes the colour.
- [ ] `ledger-online` and `ledger-login`: an item naming a watched person puts an amber quill on their Online row (red when overdue, a count for several), and the items after their "has awoken". `DONE`: the quill goes at once.
- [ ] `room-social` and `room-comms`: the newbie leaf in Online and Comms.
- [ ] `patrolling-room`: shrines and totems in Here by their god's stance: friendly green, hostile orange with a tinted row and "⚠ hostile shrine" in the header, an unsorted god plain with the shrine icon (hover: neutral).
- [ ] `sigils-room`: ▮ on monoliths; "⚠ no monolith" in a city room without one (not on a road named after a city, not on an ignored room).
- [ ] `harvesting-room` *(with patrolling on)*: the plants line under the description, green/yellow/red, "⚠ N plants missing"; hidden in rooms not checked.
- [ ] `basher-room`: kill-order badges, the next one outlined, ignored types dimmed, ⚔ state by the room name.
- [ ] `room-basher`: a mob that is someone's loyal has no kill-order number and is never targeted; mobs arriving mid-run are probed after the run.
- [ ] `magi-room`: oysters and dropped pearls green with ◉, hover "drops pearls"; a targeted oyster glows yellow with ◉ kept; with a kill order, badge and ◉ side by side.
- [ ] `partycomms-room` *(party)*: members' names after ◂ on the mobs they target, in the mob names' font and size, moving as they retarget; a member who leaves or stops reporting is gone within ~30 s.
- [ ] `social-basher`: an enemy arriving mid-run is named as one.
- [ ] `harvesting-ledger`: "Harvest run" when a plant is under 90% of its minimum; gone when all are back. `DROP` keeps it away until then.
- [ ] `talpieces-ledger`: a complete colour, and spares at 16+; no flicker during a listing.
- [ ] `magi-ledger`: "Collect N pearls" below 90%; `LEDGER DISMISSED` / `RESTORE magi`.
- [ ] `sigils-ledger`: one "Sigil patrol" item with a due date; a monolith closer to expiry moves the date; `SIGILS CLEAR CONFIRM` takes it back.
- [ ] `self-ledger`: an explorer rank drop adds "Explore a new area"; it stays after recovery and reload; a later drop brings a new one.
- [ ] `huntstats-coffers`: starting a hunt in a known area proposes a goal (~10% over the average); `COFFERS ACCEPT` keeps it after the hunt; not accepted, leaving takes it back; a new area: none.
- [ ] `coffers-standings`: 5,000+ gold from someone outside your party suggests a +; less, or from the party: nothing.
- [ ] `huntstats-standings` *(party)*: a 30-minute party hunt suggests a + with each member; shorter: nothing.
- [ ] `dmgchart-huntstats`: the filing notice ends "took N/s (max hit M)"; Stats tab and `AREAS` show it, coloured by `HUNTSTATS TANK`. Reload mid-hunt: no damage figures for that hunt.
- [ ] `defcon-self`: see section 5.

## 11. Docs

- [ ] `python3 tools/docs.py --check` reports the docs up to date.
- [ ] Each package's page still matches what it does (spot-check the packages that changed in this release); a tab that changed has a fresh screenshot (`python3 tools/screens.py`).
