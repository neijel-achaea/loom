# Saved variables

Every variable Loom's packages save: what it holds, the release it first appeared in, and what it was called before (#134). `tools/upgrade.py` reads this page ([Testing](testing.md#3-upgrade-test)): every variable the current build uses must be listed, and every setting must survive an upgrade from every release since 0.2.

**Kinds**

- **setting**: the player chose it. Keeps its value through every upgrade, or is migrated (its old name under *Was*).
- **data**: built up by play (logs, sessions, records). Still there after an upgrade; its value changes as you play.
- **state**: the package's own bookkeeping (your name and class from GMCP, the pause). Rewritten at any time.
- **legacy**: an old name. Read at setup to migrate it into the row that names it under *Was*, then deleted (a few are still read as a fallback, as noted). Listed for as long as the code that reads it is there.

**Rules**

- Renaming or reshaping a variable: the package copies the old one into the new name once on load (only when the new one is empty), then deletes the old one. Add both rows here: the old one as *legacy*, the new one naming it under *Was*.
- A downgrade may start a package fresh, but must never throw.
- `<class>` and `<group>` in a name stand for a family (`self_want_druid`).
- *Since* is the first release whose build used the name. A version after the latest release means it isn't released yet.

## Shared

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `pauseTriggers` | state | 0.1 | "on" while triggers are paused (LOOM PAUSE, or a package waiting on the game) |  |
| `tar` | state | 0.1 | your target, shared with your own aliases |  |
| `debug` | setting | 0.1 | "on" for extra notices from loom, hunting, fishing and basher |  |
| `activeClass` | legacy | 0.1 | the class before hunting_class; still read when hunting_class is empty |  |

## artificing

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `artificing_staff` | setting | 0.2 | the staff attack STAFF CAST uses | `staffAttack` |
| `staffAttack` | legacy | 0.1 | old name of artificing_staff |  |

## basher

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `basher_priorities` | setting | 0.6 | kill order per area: which mobs are active, in order |  |
| `basher_rage` | setting | 0.6 | battlerage use (BASHER RAGE) |  |
| `basher_raze` | setting | 0.6 | raze shielded targets (BASHER RAZE) |  |
| `basher_interrupt` | setting | 0.8 | finish the fight and stop when someone shows up (BASHER INTERRUPT) |  |
| `basher_flee_health` | setting | 0.6 | health percent that steps you back (wimpy) |  |
| `basher_flee_mana` | setting | 0.6 | mana percent that steps you back (wimpy) |  |
| `basher_flee_dir` | setting | 0.6 | the direction wimpy steps you |  |
| `basher_name` | state | 0.6 | your name, from GMCP |  |

## civic

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `civic_aide_on` | setting | 0.2 | on or off duty as ambassador aide |  |
| `civic_aide_title` | setting | 0.2 | your aide title |  |
| `civic_aide_clan` | setting | 0.2 | the novice clan you help in |  |

## coffers

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `coffers_goal` | setting | 0.2 | the gold goal | `gc_goal` |
| `coffers_bigcoin` | setting | 0.2 | single gains or losses worth announcing | `gc_bigcoin` |
| `coffers_gap` | setting | 0.2 | minutes without a prompt that close a session | `gc_gap` |
| `coffers_graph_sess` | setting | 0.2 | session graph shown | `gc_graph_sess` |
| `coffers_graph_long` | setting | 0.2 | day-by-day graph shown | `gc_graph_long` |
| `coffers_graph_h` | setting | 0.2 | graph height | `gc_graph_h` |
| `coffers_span_mins` | setting | 0.2 | minutes the session graph covers | `gc_span_mins` |
| `coffers_span_days` | setting | 0.2 | days the long graph covers | `gc_span_days` |
| `coffers_goal_base` | data | 0.2 | fortune when the goal was set | `gc_goal_base` |
| `coffers_goal_t` | data | 0.2 | when the goal was set | `gc_goal_t` |
| `coffers_goal_done` | data | 0.2 | goal reached | `gc_goal_done` |
| `coffers_goal_src` | data | 0.5 | the package that proposed the goal |  |
| `coffers_min` | data | 0.2 | fortune readings, per minute | `gc_min` |
| `coffers_days` | data | 0.2 | fortune per day | `gc_days` |
| `coffers_sess` | data | 0.2 | the open session | `gc_sess` |
| `coffers_sessions` | data | 0.2 | closed sessions | `gc_sessions` |
| `coffers_rec` | data | 0.2 | records | `gc_rec` |
| `coffers_proposals` | data | 0.5 | goals other packages proposed |  |
| `coffers_dismissed` | data | 0.5 | proposals dismissed until withdrawn |  |
| `gc_min` | legacy | 0.1 | old name of coffers_min |  |
| `gc_days` | legacy | 0.1 | old name of coffers_days |  |
| `gc_sessions` | legacy | 0.1 | old name of coffers_sessions |  |
| `gc_rec` | legacy | 0.1 | old name of coffers_rec |  |
| `gc_sess` | legacy | 0.1 | old name of coffers_sess |  |
| `gc_graph_sess` | legacy | 0.1 | old name of coffers_graph_sess |  |
| `gc_graph_long` | legacy | 0.1 | old name of coffers_graph_long |  |
| `gc_graph_h` | legacy | 0.1 | old name of coffers_graph_h |  |
| `gc_span_mins` | legacy | 0.1 | old name of coffers_span_mins |  |
| `gc_span_days` | legacy | 0.1 | old name of coffers_span_days |  |
| `gc_gap` | legacy | 0.1 | old name of coffers_gap |  |
| `gc_bigcoin` | legacy | 0.1 | old name of coffers_bigcoin |  |
| `gc_goal` | legacy | 0.1 | old name of coffers_goal |  |
| `gc_goal_base` | legacy | 0.1 | old name of coffers_goal_base |  |
| `gc_goal_t` | legacy | 0.1 | old name of coffers_goal_t |  |
| `gc_goal_done` | legacy | 0.1 | old name of coffers_goal_done |  |

## comms

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `comms_cap` | setting | 0.4 | lines kept per channel |  |
| `comms_muted` | setting | 0.4 | muted channels |  |
| `comms_saved` | data | 0.4 | the lines shown, kept across reloads |  |
| `comms_name` | state | 0.4 | your name, from GMCP |  |

## conjuration

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `conjuration_ouroboros` | setting | 0.2 | the ouroboros the reagents go into |  |
| `conjuration_sigil_from` | setting | 0.2 | the ouroboros the sigil is taken from |  |

## crystalism

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `crystalism_pearls` | setting | 0.2 | pick up pearls (CRYSTALISM PEARLS) |  |
| `crystalism_portal` | setting | 0.2 | open portals on request (CRYSTALISM PORTAL) |  |
| `crystalism_min` | setting | 0.5 | minimum per shape (CRYSTALISM MIN) |  |
| `crystalism_default_min` | setting | 0.5 | default minimum |  |
| `crystalism_rift` | data | 0.5 | rift counts last read |  |

## defcon

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `defcon_levels` | setting | 0.3 | DEFCON level per class table | `defcon_level` |
| `defcon_autoinit` | setting | 0.3 | DEFCON INIT at login (INIT AUTO) | `defcon_autoup` |
| `defcon_custom` | setting | 0.3 | your changes to the class tables |  |
| `defcon_retired` | state | 0.3 | retired defences already reset, per table |  |
| `defcon_class` | state | 0.2 | the class table in use |  |
| `defcon_level` | legacy | 0.1 | one level for every class, before per-class levels |  |
| `defcon_autoup` | legacy | 0.2 | old name of defcon_autoinit |  |

## dmgchart

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `dmgchart_gap` | setting | 0.2 | quiet seconds that end a fight | `dc_gap` |
| `dmgchart_window` | setting | 0.3 | seconds health lasts looks back over |  |
| `dmgchart_warn` | setting | 0.4 | warn when health lasts drops below this |  |
| `dmgchart_sessions` | data | 0.2 | saved recordings | `dc_sessions` |
| `dmgchart_open` | data | 0.2 | the recording under way | `dc_open` |
| `dc_gap` | legacy | 0.1 | old name of dmgchart_gap |  |
| `dc_sessions` | legacy | 0.1 | old name of dmgchart_sessions |  |
| `dc_open` | legacy | 0.1 | old name of dmgchart_open |  |

## elementalism

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `elementalism_pronouns` | setting | 0.2 | pronouns the set pieces use |  |
| `elementalism_name` | state | 0.2 | your name, from GMCP or ELEMENTALISM NAME |  |

## fishing

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `fishing_bait` | setting | 0.2 | the bait | `bait` |
| `fishing_ding` | setting | 0.2 | party ding on a record |  |
| `fishing_rebait` | setting | 0.8 | bait the hook again after a catch |  |
| `bait` | legacy | 0.1 | old name of fishing_bait |  |

## fishingstats

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `fishingstats_gap` | setting | 0.2 | idle minutes that file a session | `fsh_gap` |
| `fishingstats_me` | setting | 0.2 | your angler name, if set by hand | `fsh_me` |
| `fishingstats_colours` | setting | 0.2 | anglers' colours | `fsh_colours` |
| `fishingstats_area` | setting | 0.2 | the pinned area | `fsh_area` |
| `fishingstats_session` | data | 0.2 | this session | `fsh_session` |
| `fishingstats_log` | data | 0.2 | filed sessions | `fsh_log` |
| `fishingstats_records` | data | 0.2 | yearly records | `fsh_records` |
| `fsh_session` | legacy | 0.1 | old name of fishingstats_session |  |
| `fsh_log` | legacy | 0.1 | old name of fishingstats_log |  |
| `fsh_records` | legacy | 0.1 | old name of fishingstats_records |  |
| `fsh_me` | legacy | 0.1 | old name of fishingstats_me |  |
| `fsh_colours` | legacy | 0.1 | old name of fishingstats_colours |  |
| `fsh_area` | legacy | 0.1 | old name of fishingstats_area |  |
| `fsh_gap` | legacy | 0.1 | old name of fishingstats_gap |  |

## harvesting

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `harvesting_on` | setting | 0.2 | harvest as you walk | `hv_on` |
| `harvesting_default_min` | setting | 0.2 | default minimum per plant |  |
| `harvesting_min` | setting | 0.2 | minimum per plant | `hv_min` |
| `harvesting_map` | data | 0.2 | plant name to rift name | `hv_map` |
| `harvesting_stock` | data | 0.2 | rift stock last read | `hv_stock` |
| `hv_on` | legacy | 0.1 | old name of harvesting_on |  |
| `hv_min` | legacy | 0.1 | old name of harvesting_min |  |
| `hv_map` | legacy | 0.1 | old name of harvesting_map |  |
| `hv_stock` | legacy | 0.1 | old name of harvesting_stock |  |

## hunting

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `hunting_dragon_mode` | setting | 0.2 | dragon attack mode | `dragonMode` |
| `hunting_dragon_attack` | setting | 0.2 | dragon attack | `dragonAttack` |
| `hunting_autogold` | setting | 0.2 | pick up and put away gold | `autogold` |
| `hunting_after_form` | setting | 0.2 | command sent when dragonform rises or falls |  |
| `hunting_party_target` | setting | 0.2 | party target announcements |  |
| `hunting_mains` | setting | 0.3 | main attack per class, chosen by hand |  |
| `hunting_mains_added` | setting | 0.3 | extra main attacks added by hand |  |
| `hunting_class` | state | 0.2 | your class, from GMCP |  |
| `hunting_name` | state | 0.3 | your name, from GMCP |  |
| `hunting_toggles` | state | 0.3 | toggle keys; cleared at every load |  |
| `dragonMode` | legacy | 0.1 | old name of hunting_dragon_mode |  |
| `dragonAttack` | legacy | 0.1 | old name of hunting_dragon_attack |  |
| `autogold` | legacy | 0.1 | old name of hunting_autogold |  |
| `rage_costs` | legacy | 0.1 | pre-Loom rage tracking, deleted |  |
| `rage_slots` | legacy | 0.1 | pre-Loom rage tracking, deleted |  |
| `rage_cd` | legacy | 0.1 | pre-Loom rage tracking, deleted |  |
| `rage_global` | legacy | 0.1 | pre-Loom rage tracking, deleted |  |

## huntstats

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `huntstats_party` | setting | 0.4 | the party, by hand |  |
| `huntstats_weights` | setting | 0.4 | HUNTSTATS SUGGEST weights |  |
| `huntstats_splittell` | setting | 0.4 | also send the split to party tell |  |
| `huntstats_tank` | setting | 0.5 | max health a second you heal back (colours damage taken) |  |
| `huntstats_log` | data | 0.2 | filed hunts | `hs_log` |
| `huntstats_areas` | data | 0.2 | totals per area | `hs_areas` |
| `huntstats_open` | data | 0.2 | the hunt under way | `hs_open` |
| `huntstats_name` | state | 0.4 | your name, from GMCP |  |
| `huntstats_button` | legacy | 0.2 | an old button setting, deleted |  |
| `hs_log` | legacy | 0.1 | old name of huntstats_log |  |
| `hs_areas` | legacy | 0.1 | old name of huntstats_areas |  |
| `hs_open` | legacy | 0.1 | old name of huntstats_open |  |

## ledger

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `ledger_debug` | setting | 0.2 | debug notices | `lg_debug` |
| `ledger_items` | data | 0.2 | the items | `lg_items` |
| `ledger_seq` | data | 0.2 | the last item number | `lg_seq` |
| `ledger_dismissed` | data | 0.5 | generated items done or dropped by hand |  |
| `ledger_day` | state | 0.2 | the Achaean day last read | `lg_day` |
| `lg_items` | legacy | 0.1 | old name of ledger_items |  |
| `lg_seq` | legacy | 0.1 | old name of ledger_seq |  |
| `lg_day` | legacy | 0.1 | old name of ledger_day |  |
| `lg_debug` | legacy | 0.1 | old name of ledger_debug |  |

## levelgraph

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `levelgraph_graph_long` | setting | 0.2 | day-by-day graph shown | `lvl_graph_long` |
| `levelgraph_graph_sess` | setting | 0.2 | session graph shown | `lvl_graph_sess` |
| `levelgraph_graph_h` | setting | 0.2 | graph height | `lvl_graph_h` |
| `levelgraph_span_mins` | setting | 0.2 | minutes the session graph covers | `lvl_span_mins` |
| `levelgraph_span_days` | setting | 0.2 | days the long graph covers | `lvl_span_days` |
| `levelgraph_gap` | setting | 0.8 | minutes without a prompt that close a session |  |
| `levelgraph_sess` | data | 0.8 | the open session |  |
| `levelgraph_min` | data | 0.2 | level readings, per minute | `lvl_min` |
| `levelgraph_day` | data | 0.2 | level per day | `lvl_day`, `lvl_hist` |
| `lvl_min` | legacy | 0.1 | old name of levelgraph_min |  |
| `lvl_day` | legacy | 0.1 | old name of levelgraph_day |  |
| `lvl_graph_long` | legacy | 0.1 | old name of levelgraph_graph_long |  |
| `lvl_graph_sess` | legacy | 0.1 | old name of levelgraph_graph_sess |  |
| `lvl_graph_h` | legacy | 0.1 | old name of levelgraph_graph_h |  |
| `lvl_span_days` | legacy | 0.1 | old name of levelgraph_span_days |  |
| `lvl_span_mins` | legacy | 0.1 | old name of levelgraph_span_mins |  |
| `lvl_hist` | legacy | 0.1 | older history, folded into levelgraph_day |  |

## loom

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `loom_autoupdates` | setting | 0.3 | check for updates at login |  |
| `loom_links_off` | setting | 0.5 | integrations switched off |  |
| `loom_theme` | setting | 0.8 | tab theme |  |
| `loom_city` | state | 0.8 | your city, from GMCP (for the auto theme) |  |
| `loom_updates_mode` | state | 0.3 | whether the update check is the automatic one |  |
| `currentRoomId` | legacy | 0.1 | pre-Loom room tracking, deleted |  |
| `currentRoomName` | legacy | 0.1 | pre-Loom room tracking, deleted |  |
| `currentArea` | legacy | 0.1 | pre-Loom room tracking, deleted |  |
| `currentEnvironment` | legacy | 0.1 | pre-Loom room tracking, deleted |  |

## partycomms

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `partycomms_on` | setting | 0.2 | reporting on | `party_on` |
| `partycomms_name` | state | 0.2 | your name, from GMCP | `party_me` |
| `partycomms_class` | state | 0.2 | your class, from GMCP |  |
| `partycomms_level` | state | 0.8 | your level, from GMCP |  |
| `party_on` | legacy | 0.1 | old name of partycomms_on |  |
| `party_me` | legacy | 0.1 | old name of partycomms_name |  |
| `party_data` | legacy | 0.1 | pre-Loom party state, deleted |  |
| `party_last_send` | legacy | 0.1 | pre-Loom party state, deleted |  |
| `party_last_sent` | legacy | 0.1 | pre-Loom party state, deleted |  |
| `party_last_render` | legacy | 0.1 | pre-Loom party state, deleted |  |
| `party_ih` | legacy | 0.1 | pre-Loom party state, deleted |  |
| `party_ih_at` | legacy | 0.1 | pre-Loom party state, deleted |  |
| `party_ih_tail` | legacy | 0.1 | pre-Loom party state, deleted |  |
| `tarname` | legacy | 0.1 | pre-Loom party state, deleted |  |
| `tarname_for` | legacy | 0.1 | pre-Loom party state, deleted |  |

## patrolling

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `patrolling_on` | setting | 0.2 | silent PLANTS check on entering a room |  |
| `patrolling_clan` | setting | 0.2 | clan that hears reports |  |
| `patrolling_gods` | setting | 0.5 | god stances | `patrolling_god` |
| `patrolling_last` | data | 0.2 | the last report | `patrol_last` |
| `patrolling_god` | legacy | 0.2 | one god before stances |  |
| `patrol_last` | legacy | 0.1 | old name of patrolling_last |  |

## room

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `room_desc` | setting | 0.4 | description folded or open |  |
| `room_probe` | setting | 0.8 | probe each new mob once for loyals |  |
| `room_loyal_ignore` | setting | 0.8 | owners that are places, not loyals |  |
| `room_newbies` | data | 0.5 | players seen with newbie titles |  |
| `room_name` | state | 0.4 | your name, from GMCP |  |

## security

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `security_antitheft` | setting | 0.2 | anti-theft on | `antitheft` |
| `security_backpack` | setting | 0.2 | your backpack | `backpack` |
| `security_backpack_desc` | setting | 0.2 | its description |  |
| `security_items` | setting | 0.2 | worn items antitheft watches |  |
| `security_house` | setting | 0.2 | your house state commands |  |
| `antitheft` | legacy | 0.1 | old name of security_antitheft |  |
| `backpack` | legacy | 0.1 | old name of security_backpack; hunting still reads it when security is absent |  |
| `my_selfishness` | legacy | 0.1 | pre-Loom selfishness flag, deleted |  |

## self

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `self_want_<class>` | setting | 0.1 | watched defences, per class | `self_want` |
| `self_keep` | setting | 0.1 | defences always kept |  |
| `self_name` | setting | 0.2 | name in the tab title, if set by hand | `my_name` |
| `self_want` | legacy | 0.1 | watched defences before per-class lists; still the start for a class with none |  |
| `my_name` | legacy | 0.1 | old name of self_name |  |

## sigils

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `sigils_on` | setting | 0.2 | SIGILS WATCH | `mono_on` |
| `sigils_threshold` | setting | 0.2 | months left that flag a sigil | `mono_threshold` |
| `sigils_ignored` | setting | 0.2 | rooms ignored | `mono_ignore` |
| `sigils_cost_monolith` | setting | 0.2 | monolith sigil cost | `mono_cost_monolith` |
| `sigils_cost_flame` | setting | 0.2 | flame sigil cost | `mono_cost_flame` |
| `sigils_flagged` | data | 0.2 | rooms flagged | `mono_bad` |
| `mono_on` | legacy | 0.1 | old name, see sigils |  |
| `mono_threshold` | legacy | 0.1 | old name, see sigils |  |
| `mono_bad` | legacy | 0.1 | old name, see sigils |  |
| `mono_ignore` | legacy | 0.1 | old name, see sigils |  |
| `mono_cost_monolith` | legacy | 0.1 | old name, see sigils |  |
| `mono_cost_flame` | legacy | 0.1 | old name, see sigils |  |

## social

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `social_lists` | setting | 0.2 | people per group | `hlFamily`, `hlEnemies`, `hlOrder`, `hlHouse`, `hlCity`, `hlAllies`, `hlFriends` |
| `social_colors` | setting | 0.2 | group colours | `hlColor_<group>` |
| `social_watch` | setting | 0.2 | groups watched in Online | `wlWatch` |
| `social_poll` | setting | 0.2 | QW polling | `wlEnabled` |
| `social_poll_every` | setting | 0.8 | seconds between polls |  |
| `social_debug` | setting | 0.2 | debug notices | `wlDebug` |
| `social_offline` | setting | 0.4 | offline section shown |  |
| `social_sync_enemies` | setting | 0.8 | CITY ENEMIES replaces the enemies group |  |
| `social_colour_by` | setting | 0.5 | colour names by group or standing |  |
| `social_seen` | data | 0.4 | when watched people were last seen |  |
| `hlFamily` | legacy | 0.1 | old list, migrated into social_lists |  |
| `hlEnemies` | legacy | 0.1 | old list, migrated into social_lists |  |
| `hlOrder` | legacy | 0.1 | old list, migrated into social_lists |  |
| `hlHouse` | legacy | 0.1 | old list, migrated into social_lists |  |
| `hlCity` | legacy | 0.1 | old list, migrated into social_lists |  |
| `hlAllies` | legacy | 0.1 | old list, migrated into social_lists |  |
| `hlFriends` | legacy | 0.1 | old list, migrated into social_lists |  |
| `hlColor_<group>` | legacy | 0.1 | old group colour, migrated into social_colors |  |
| `wlEnabled` | legacy | 0.1 | old name of social_poll |  |
| `wlDebug` | legacy | 0.1 | old name of social_debug |  |
| `wlWatch` | legacy | 0.1 | old name of social_watch |  |

## standings

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `standings_db` | data | 0.2 | people, events and scores | `st_db` |
| `standings_cal` | data | 0.2 | event weights | `st_cal` |
| `st_db` | legacy | 0.1 | old name of standings_db |  |
| `st_cal` | legacy | 0.1 | old name of standings_cal |  |

## talpieces

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `talpieces_graph` | setting | 0.2 | graph shown | `tal_graph_on` |
| `talpieces_graph_h` | setting | 0.2 | graph height | `tal_graph_h` |
| `talpieces_combine` | setting | 0.2 | queue TALISMAN COMBINE when you list |  |
| `talpieces_pieces` | data | 0.2 | pieces owned | `tal_pieces` |
| `talpieces_hist` | data | 0.2 | history | `tal_hist` |
| `tal_graph_on` | legacy | 0.1 | old graph switch (1/0) |  |
| `tal_graph_h` | legacy | 0.1 | old name of talpieces_graph_h |  |
| `tal_pieces` | legacy | 0.1 | old name of talpieces_pieces |  |
| `tal_hist` | legacy | 0.1 | old name of talpieces_hist |  |

## vials

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `vials_map` | setting | 0.2 | which vial holds which elixir |  |
| `vials_info` | data | 0.4 | what VIALS LEARN read |  |

## vision

| Variable | Kind | Since | Holds | Was |
|---|---|---|---|---|
| `vision_on` | setting | 0.2 | read alertness reports |  |
| `vision_hide` | setting | 0.2 | hide reports about your city's members |  |
| `vision_alert` | setting | 0.2 | tell the party when an enemy comes near |  |
| `vision_channel` | setting | 0.2 | channel for alerts |  |
