# Regression checklist

One pass through everything Loom does, in game. Run it before a release, and whenever a change touches several packages. It was built from the in-game checklists of every merged pull request (#139), with duplicates, version checks and behaviour that has since changed taken out.

## How to run it

- **Copy this page** into a new issue titled "Regression run: <version>", so each box can be ticked there.
- **Use the release candidate**: every package from `dist/` on the branch or tag being tested.
- **Each failure becomes a bug** in the current milestone, linked from the run's issue. Note the package, the step and what happened.
- **Characters:** at least one main (with dragonform if you have it), and an alt of another class. Sections marked *(alt)* want a second character; *(party)* a second player.
- **Keep it current:** when a pull request adds an in-game checklist, add its lasting steps here in the same PR.

## 1. Install and load

- [ ] **Fresh profile, one package:** import it alone. No errors, its install notice shows, `LOOM` isn't needed for it to work, its `HELP` prints. Repeat for each package (or a sample of five, including one with a tab).
- [ ] **Everything:** import every package. `LOOM` lists them all with versions and commands; `LOOM LINKS` lists every link as on.
- [ ] **The basher without hunting:** an orange notice says hunting is needed; nothing is sent.
- [ ] **Reimport over itself:** reimport any package without reloading. Its settings stay, no duplicate timers (no doubled notices).
- [ ] **Upgrade:** import the previous release, change a few settings in several packages, then import the candidate over it. Nothing reset.
- [ ] **Page reload:** every tab redraws; toggles that should load off (basher, harvesting) are off.
- [ ] **`LOOM UPDATES`:** lists what's out of date ("up to date" in lime otherwise). At login on a current profile: nothing. `LOOM UPDATES AUTO OFF`, relog: no check.

## 2. Every package

For each package:

- [ ] `<PACKAGE> HELP`: a monospace table, columns aligned, `<…>` visible.
- [ ] Bare `<PACKAGE>`: a status in cyan.
- [ ] A typo'd subcommand: orange, pointing to HELP.
- [ ] A setting changed: lime.
- [ ] Its tab (if any): fills the whole tab with its own background, icon shows after a reload.

And for the suite:

- [ ] `LOOM PAUSE ON`: nothing is sent by any package (walk with harvesting, patrolling and sigils on; fish; hunt with the basher primed). `LOOM PAUSE OFF`: all resume.
- [ ] Sleep and meditate: Loom pauses on its own and resumes when you wake or finish.
- [ ] `QUIT` mid-hunt: the hunt is filed, herbs go to the rift, gold to the backpack, then you quit.

## 3. Hunting

- [ ] `HUNTING` shows your class, main attack, dragon mode and autogold. On a class with no layout: generic keys and "(not configured yet)".
- [ ] F1 lights on balance and equilibrium; a rage key lights only when ready (off cooldown, global cooldown clear, enough rage).
- [ ] Using a rage ability: its line is tagged (`[WINDLASH]`), its key and the others go dark (global cooldown); they relight on "You can use another Battlerage ability again" and "You can use Windlash again".
- [ ] Using the shieldbreak: tagged, and the other rage keys you can afford **stay lit**. On an unshielded mob: `[NO SHIELD]`.
- [ ] `HUNTING MAIN` lists the main attacks; switching one changes F1 and survives a reload. `HUNTING MAIN TEST = say hello` adds one; `HUNTING MAIN TEST =` removes it.
- [ ] Criticals highlighted by tier; your own only.
- [ ] `HUNTING AUTOGOLD ON`: gold from your kill is picked up (into the backpack with security); someone else's kill: left. `ALL`: anyone's. `OFF`: none.
- [ ] Change class or form: keys and rage costs switch; `HUNTING RAGE` shows only the new class's abilities, cooldowns empty.
- [ ] *Dragon:* F8 cycles PHY → MAG → AUTO; in AUTO, F1 flips between Gut and Incantation as endurance and willpower drain. `HUNTING AFTERFORM DEFCON INIT`, then dragonform: init after the roar and after it melts.
- [ ] Toggles (Sneak, Weave, Block): the key reads ON/OFF without lighting; typed by hand, the key follows; reload: OFF.
- [ ] F8–F12 need Button Count 12; the install notice and `HUNTING HELP` say so.

### Every class

For each class you can play (one row each; the ones you can't, skip): F1 attacks and is tagged; each rage ability is tagged, goes dark after use and relights on its "You can use X again"; the shieldbreak works on a shielded mob; F11 and toggles do what their label says.

<!-- built from hunting's class files (2026-10-17); update a row when its class changes -->
- [ ] **Alchemist**: F1 Iron; rage: Miasma, Magnesium, Pathogen, Cadmium, Hypnotic, Provoke; shieldbreak: Caustic (on a shielded mob); F11: Tin
- [ ] **Apostate**: F1 Bleed; rage: Convulsions, Burrow, Bloodlet, Possess, Horrify, Provoke; shieldbreak: Pierce (on a shielded mob); F11: Horrify; toggle: Sneak
- [ ] **Bard**: F1 Jab; rage: Moulinet, Howlslash, Cyclone, Trill, Charm, Provoke; shieldbreak: Resonance (on a shielded mob)
- [ ] **Black Dragon**: F1 Gut or Incantation, by the F8 mode; rage: Dragonspit, Dragonsting, Override, Corrode, Dragonfear, Provoke; shieldbreak: Dissolve (on a shielded mob); F11: Dragonheal
- [ ] **Blademaster**: F1 Drawslash; rage: Leapstrike, Spinslash, Headstrike, Daze, Nerveslash, Provoke; shieldbreak: Shatter (on a shielded mob)
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

## 4. Basher

- [ ] `BASHER`: OFF, with your class's main attack. `BASHER ON`: primed, the curing reminder once, nothing sent until you attack.
- [ ] Your first attack starts the run (lime). One attack per recovery, no double sends.
- [ ] Several mobs of the same name (no kill order in the area): it carries on until none is left, then "run over, still primed". Attack in the next room: starts again.
- [ ] Target a player by name: nothing sent.
- [ ] `BASHER STOP` mid-fight: stops at once.
- [ ] Three attacks that took no balance: it switches itself off.
- [ ] Venom confusion: one `DIAGNOSE` on the next recovery.
- [ ] **Rage:** `BASHER RAGE` shows the order; during a run abilities go out on their own, one per global cooldown, without delaying the main attack. `BASHER RAGE OFF` stops it; the keys still light.
- [ ] **Shields:** a shield holds attacks; with the rage, the shieldbreak goes out at once ("shield razed") and attacks resume; without it, the notice says what's missing. No double raze. *Dragon:* Blast on recovery while dragonbreath is up; without breath, "no dragonbreath" and it waits.
- [ ] **Wimpy:** `BASHER WIMPY` shows 40% health / 20% mana. Drop below in a run: one step back the way you came, "fled", still primed. After a login (no way back) and no `WIMPY DIR`: it says so and doesn't move.
- [ ] **Interruptions:** another player walks in, a tell to you, or your city channel names you, mid-run: orange notice, the current mob dies, nothing new starts. Your own tells and city lines change nothing. An enemy (with social): named as one. Starting with people already there: normal run.
- [ ] **Kill order:** in a new area its mob types join IGNORED with NEW. Make two ACTIVE and reorder them: Here's badges follow at once. Primed: your target jumps to the top mob when mobs arrive or die; a target you pick stays until the queue changes; no "Your target is now" spam. A run goes through the active mobs in order and stops when only ignored ones are left.

## 5. Defences: DEFCON and Self

- [ ] `DEFCON`: your level (or "5, not applied yet") and class. `DEFCON LIST` by tier, your changes marked `*`.
- [ ] `DEFCON 4` then `DEFCON 3`: only the difference is sent, priority lines hidden. `DEFCON 3` again: full resync.
- [ ] Each class and dragonform keep their own level; switching form says which level applies.
- [ ] Log in: `DEFCON INIT` runs once by itself (`DEFCON INIT AUTO OFF`, relog: nothing). Init order: common commands first, the class's after; a morph's follow-ups after the morph.
- [ ] `DEFCON ADD` a defence at a kept tier: priority set at once. `REMOVE` a default: reset; `RESET` it: back. Relog: changes kept. `DEFCON EXPORT` prints a readable table.
- [ ] Insomnia cleared: raised again (not while paused). Choking underwater: pear from the rift.
- [ ] **Self tab:** name, class, level, afflictions and defences fill after `DIAG` and `DEF`; ranks after `SCORE`.
- [ ] Lose a watched (`SELF WANT`) defence: announced and red; struck through for two minutes. Each class has its own `SELF WANTS`.
- [ ] `SELF KEEP` an affliction: gone from the row and the count.
- [ ] Venom confusion: yellow "diag" chip until `DIAG`.
- [ ] Explorer or XP rank moves: green ▲ / red ▼ against the page load; a new character shows `-` until its first rank.
- [ ] *With DEFCON:* the Defences heading names the level; missing DEFCON defences amber, `SELF WANT` ones red; a stripped DEFCON defence raises no notice. Change level: the watched set follows.

## 6. Room, people and talk

- [ ] **Here:** moving fills name, area, environment, tags, exits, number, description (folded; click unfolds and it stays so; `ROOM DESC OPEN`).
- [ ] Players come and go (yourself left out), full title on hover; flying up leaves, landing joins.
- [ ] Mobs one row each in the room's order; a corpse greyed; picking something up removes it; items merged with a count.
- [ ] Targeting (click, `ST`, an alias, `tar`): the right mob glows with its health, at once; after it dies the glow moves to the next row. Target a player: red glow; `ST RAT` afterwards moves it to a rat.
- [ ] A small room fills the whole tab.
- [ ] Newbies (Uaithne, Ithin, Tuqad): green leaf, title on hover. `CWHO` teaches the list.
- [ ] **Social:** names coloured in every line, your own in yellow. `SOCIAL ADD friends <someone in the room>`: colour changes at once. `SOCIAL LIST`, `DEL`.
- [ ] Watched people logging in and out: "has awoken" / "has drifted into slumber". No `QW` output in the main window, even lagged.
- [ ] `CITY ENEMIES`: "city enemies loaded n / n".
- [ ] **Online tab:** watched people online with colours and "online for"; arrivals glow, departures grey then go; OFFLINE with "last seen" (survives a reload), folds on click or `SOCIAL OFFLINE OFF`. `WATCH`/`UNWATCH` updates it at once.
- [ ] **Comms:** says, tells both ways, party, clan and city lines in All, in your game colours, tagged; unread counts on filters, cleared on viewing; Tells newest first, click opens the conversation; click a name → `t <name> `; mute from the tab and `COMMS MUTE`, kept after a reload; header stays at the top; following new lines at the bottom, not yanked while reading back; after a reload the latest lines are back.
- [ ] **Standings:** a nudge and `UNDO`; `STANDINGS <name>` shows history, tags, social chips; `SET`; `TAG` and `@tag`; `REVIEW`, `OK`, `SKIP`.
- [ ] **Vision:** a city member in alertness range: line hidden (`VISION HIDE OFF` shows it); an enemy: line coloured, party alert on the set channel.
- [ ] **PartyComms** *(party)*: `PARTYCOMMS TEST` shows two chips, `CLEAR` removes them; in a party, chips for each member with bars, rage and target (green when shared); no reports or IH lines in the main window; leaving the party switches sharing off with a notice.

## 7. Hunting records

- [ ] **Huntstats:** hunt a few minutes: `HUNTSTATS` shows the area, rates, kills, next level, Dragonhood (not on a dragon). The Stats tab's top shows the hunt under way, updating after each kill.
- [ ] Refresh mid-hunt: "resumed hunt in …". Leave the area: filed with a notice; in `HUNTSTATS LOG`, `AREAS` and the tab.
- [ ] A visit under a minute: nothing filed.
- [ ] `HUNTSTATS SUGGEST`: ten areas; one just hunted says "last today". `SUGGEST WEIGHTS 50 50 0` reorders and survives a reload.
- [ ] *(party)* `PARTY ADD`; people walking through aren't listed; `SPLIT` mid-hunt and at the end; a bystander picking up gold changes nothing; `SPLIT REPORT` reaches party tell; `SPLIT TELL ON` sends it at the end.
- [ ] **DmgChart:** a fight fills both donuts and the rates; crits in the right tier rows (a party member's not counted); bleeding is its own slice and doesn't keep the fight going; a new denizen starts a new fight.
- [ ] Health lasts appears while health falls (after a couple of hits), lengthens on a sip, absent in an easy fight. Below 10 s: one orange warning; recover and drop again: a second one. `DMGCHART WARN 15` / `OFF`, kept after a reload.
- [ ] `DMGCHART START test`, fights, `END`: saved; `LIST`, `SHOW <n>`, `LIVE`. A reload mid-recording resumes it.
- [ ] **LevelGraph:** `LEVELGRAPH` level with decimals and rates; the session graph moves once a minute; `GRAPH LONG OFF`/`ON`, `SIZE 140`.

## 8. Money, items and calendar

- [ ] **Coffers:** "the books are open" within a prompt or two of login. Deposit/withdraw: no change to the session. Pick up or spend: counted. Big gain: lime "Ka-ching"; big loss: orange.
- [ ] `COFFERS SESSIONS`, `DAYS`, `CSV`; `GOAL 10k` and its bar; `WIPE` warns; `WIPE CONFIRM` clears books, goal and proposals.
- [ ] **Ledger:** the digest prints at login, `DATE` lines hidden; dates read "12th Valnuary". `LEDGER ADD test @ +1 days`, `DONE`; a repeating one moves to its next date; `DROP`; `TOUCH` a standing item.
- [ ] **TalPieces:** a found piece counted and highlighted; listing your pieces reads every page and rebuilds the tab, combines queued (`COMBINE OFF`: none); `NEED` and `RATE` agree with the tab.
- [ ] **Vials:** `VIALS LEARN` hides the table and sets the vials with sips; `VIALS REFILL <elixir>` fills the right one; `ELIXLIST` typed by hand still shows.
- [ ] **Security:** antitheft on, remove a watched item: put back with the red warning. `GG` then `PG`: no warning, antitheft back on. With selfishness up, `GIVE` something: selfishness drops and comes back. Autogold fills the backpack.

## 9. Gathering and the city

- [ ] **Fishing:** `CL <direction>` baits and casts; nibble → tease, strike → jerk, hooked → reel, stages marked [1/4]–[4/4]; a new yearly record tells the party "Ding fish!". `FISHING BAIT` changes the bait. It never casts again by itself.
- [ ] **FishingStats:** your casts, hooks and catches under your name, others' under theirs; the area follows the game; `RANKINGS FISHING` read and a record catch flagged; a session files itself after the gap.
- [ ] **Harvesting:** walk a forest with `HARVESTING ON`: harvests and stores only what's short; rift totals update; `HARVESTING MIN 500` shrinks the list; reload: stays as left.
- [ ] **Patrolling:** `PATROLLING ON`, walk: one report per room, `PLANTS`/`INFO HERE` hidden; a hostile god's shrine reported, a friendly one not; `SUGGEST`, `STAMP`; replanting logged to the clan with the date.
- [ ] **Sigils:** `SIGILS WATCH ON` in your city: low monoliths flagged with their months, a missing one "no monolith"; walking back in doesn't repeat it; `SIGILS REPORT` with costs; `IGNORE HERE` silences a room; `CLEAR`.
- [ ] **Crystalism:** `CRYSTALISM REFINE 10`: plan line, a REFINE every 1.5 s, rift put away at the end; `STOP` mid-run; a pearl from a corpse picked up; with `PORTAL ON`, a city member's "Gate." gets a portal, someone else the polite no; attuning pauses Loom until the crystal calls.
- [ ] **Conjuration:** `CONJURATION FLAME`: no "must regain balance" spam, the sigil ends in your inventory; `CONJURATION` shows progress; `STOP` abandons.
- [ ] **Civic:** `CIVIC AIDE ON`/`OFF` sends the duty commands and the clan line; `CIVIC GREET <name>` (and `CT`/`CLT`); a lesson request accepted (not from an enemy); a new citizen escaping is added to social's city group.
- [ ] **Artificing:** `ARTIFICING STAFF FROST`: the staff key casts horripilation after the next prompt; a treaty pauses and resumes with sipping back on.
- [ ] **Elementalism:** `PINK_DRAGON` five lines two seconds apart with your name; a `FEEL_` and `ILLUSION MOSSTATTOO` cast.
- [ ] **Numpad movement:** walk on the number pad; 5 goes up, 0 down.

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
- [ ] `patrolling-room`: friendly and hostile shrines and totems flagged in Here, "⚠ hostile shrine" in the header.
- [ ] `sigils-room`: ▮ on monoliths; "⚠ no monolith" in a city room without one (not on a road named after a city, not on an ignored room).
- [ ] `harvesting-room` *(with patrolling on)*: the plants line under the description, green/yellow/red, "⚠ N plants missing"; hidden in rooms not checked.
- [ ] `basher-room`: kill-order badges, the next one outlined, ignored types dimmed, ⚔ state by the room name.
- [ ] `social-basher`: an enemy arriving mid-run is named as one.
- [ ] `harvesting-ledger`: "Harvest run" when a plant is under 90% of its minimum; gone when all are back. `DROP` keeps it away until then.
- [ ] `talpieces-ledger`: a complete colour, and spares at 16+; no flicker during a listing.
- [ ] `crystalism-ledger`: "Collect N pearls" below 90%; `LEDGER DISMISSED` / `RESTORE crystalism`.
- [ ] `sigils-ledger`: one "Sigil patrol" item with a due date; a monolith closer to expiry moves the date; `SIGILS CLEAR` takes it back.
- [ ] `self-ledger`: an explorer rank drop adds "Explore a new area"; it stays after recovery and reload; a later drop brings a new one.
- [ ] `huntstats-coffers`: starting a hunt in a known area proposes a goal (~10% over the average); `COFFERS ACCEPT` keeps it after the hunt; not accepted, leaving takes it back; a new area: none.
- [ ] `coffers-standings`: 5,000+ gold from someone outside your party suggests a +; less, or from the party: nothing.
- [ ] `huntstats-standings` *(party)*: a 30-minute party hunt suggests a + with each member; shorter: nothing.
- [ ] `dmgchart-huntstats`: the filing notice ends "took N/s (max hit M)"; Stats tab and `AREAS` show it, coloured by `HUNTSTATS TANK`. Reload mid-hunt: no damage figures for that hunt.
- [ ] `defcon-self`: see section 5.

## 11. Docs

- [ ] `python3 tools/docs.py --check` reports the docs up to date.
- [ ] Each package's page still matches what it does (spot-check the packages that changed in this release).
