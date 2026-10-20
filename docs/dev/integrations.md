# Integrations

How packages feed each other without knowing about each other. The player's side is on the [loom page](../loom.md#integrations); this is how it's built.

## The idea

No package reads another's variables or calls its functions. Instead:

- A package that has something to offer publishes a read-only **`look`**: functions on its namespace that report its own state (`client.loom.social.look.colour(name)`, `client.loom.harvesting.look.levels()`).
- A package that can take something in publishes an **`entry`**: functions that let others add to it, always tagged with where it came from (`client.loom.ledger.entry.upsert(...)`).
- The **integration** between them, a **link**, lives in the **loom** package (`packages/loom/loom_links.js`). It reads the one's `look` and either answers a question the other asks, or writes through the other's `entry`.

So a source can change its insides freely as long as its `look` keeps its promises, and neither side breaks when the other is missing.

## Two kinds of link

### Display links: a tab asks a question

A tab that wants to show something another package knows (a name's colour, a standing, a flag on an item) asks loom, **as its own package**, a question named for what it needs:

```js
var LL = client.loom.loom;
var colour = (LL && LL.answer) ? LL.answer("room", "person.colour", name) : undefined;
```

- `answer(dst, question, arg)` gives the first answer from a link into `dst` that is on; `answers(dst, question, arg)` gives all of them as `[{ link, value }]`.
- No answer (no link, link off, source missing, or no loom at all): the tab draws plainly.
- Questions are dotted and named by need (`person.colour`, `item.flags`, `room.plants`, `hunt.damage`), so another source could answer the same question later without the tab changing.
- Answers are scoped by destination. Switching off `social-room` takes the colours out of Here but not out of Comms. If two uses in one destination must switch independently, they need different questions (that's why social asks `person.standing` for the Online column and `notice.standing` for the login notice).

The link answers from its source's `look`:

```js
L.addLink({
  id: "social-room", src: "social", dst: "room", issue: 162,
  desc: "Players in the Here tab in their highlight colours",
  answers: {
    "person.colour": function (n) { var s = client.loom.social; return s && s.look ? s.look.colour(n) : undefined; }
  }
});
```

### Writing links: a source feeds a destination

A link that adds something (a ledger reminder, a coffers goal, a standings suggestion) has an `update` function. Loom runs it, debounced, when the source announces a change, when the link is switched on, and once at load. It reads the source's `look` and calls the destination's `entry`:

```js
L.addLink({
  id: "harvesting-ledger", src: "harvesting", dst: "ledger", issue: 46,
  desc: "A harvest run reminder in the ledger when plant stock runs low",
  update: function () {
    var h = client.loom.harvesting, lg = client.loom.ledger;
    if (!h || !h.look || !lg || !lg.entry) return;
    // ... decide from h.look.levels(), then:
    lg.entry.upsert({ source: "harvesting", key: "run", text: "Harvest run" });
    // or, when the condition has cleared:
    lg.entry.withdraw("harvesting", "run");
  }
});
```

Use some hysteresis where a value hovers around a line (harvesting adds its reminder below 90% of the minimum and withdraws it only once everything is back at 100%), so the item doesn't appear and vanish over and over.

## The entry points

| Destination | Entry | What happens |
| --- | --- | --- |
| ledger | `entry.upsert({ source, key, text, due \| dueIn })` → item number; `entry.withdraw(source[, key])`; `entry.get(source, key)` | The item appears at once, marked with its source; an existing one for the same source and key is updated quietly. If the player `DONE`s or `DROP`s it, it stays away until the source withdraws it. |
| coffers | `entry.propose({ source, key, amount, why })`; `entry.withdraw(source[, key])` | A proposed goal, waiting for `COFFERS ACCEPT` or `DISMISS`. One per source and key; an accepted goal belongs to the player. |
| standings | `entry.suggest({ who, step, why, source })`; `entry.withdraw(source[, who])` | A dealing waiting for `STANDINGS OK` or `SKIP`. One per source and person. |

Every entry follows principle 5 ([Conventions](conventions.md)): tagged with its source, withdrawable by it, never applied without the player seeing it.

## Redraws: announcing changes

A source tells loom when something its `look` reports has changed:

```js
if (client.loom.notify) client.loom.notify("harvesting");
```

Loom then runs the `update` of every writing link from that source, and redraws the destination of every display link from it; both are debounced, so a burst of changes runs them once. A destination says how to redraw in its registry entry:

```js
client.loom.registry.room = { version: "0.1.17", keyword: "ROOM", desc: "…",
  redraw: function () { run_function("room_render", [], "room"); } };
```

A destination whose `redraw` already gathers a burst into one draw adds `soon: true` (room does). Loom then calls it at once instead of 50 ms later, so a change that arrives in the same GMCP packet as the destination's own joins the draw already pending, rather than causing a second one.

Call `notify` as soon as the state changes, not after your own tab's delayed redraw. A notify sent from inside a timer reaches other tabs a draw too late.

Always guard the call (`if (client.loom.notify)`): the source must work without loom.

## Switching

- A link is **on** as soon as both its packages are installed (present in `client.loom.registry`), unless the player switched it off.
- `LOOM LINK <id> OFF` stores the id in `loom_links_off`; only switched-off ids are stored, so a link added in a later version starts on.
- Switching a link off calls its destination's `entry.withdraw(<source>)` and redraws the destination, so whatever the link created goes with it.
- In code: `L.linkOn(id)`, `L.linkState(id)` (`"on"`, `"off"`, `"waiting"` for a missing package).

## Adding a link

1. **Agree the design in an issue** first: what the player sees, when it appears and goes, and what switching it off does. Title it "Integration <source> → <destination>: …".
2. **In the source**, add what's needed to its `look` and call `client.loom.notify("<pkg>")` where that state changes. Bump the source's version.
3. **In the destination**, ask the question (display), or use its existing `entry` (writing). Bump its version if it changed.
4. **In loom**, add the link with `L.addLink` at the end of `loom_links.js`: id `<source>-<destination>`, `src`, `dst`, the issue number, a one-line `desc` (players see it in `LOOM LINKS`), and `answers` or `update`. Bump loom's patch version.
5. **Run `python3 tools/docs.py`**: the integrations list on the loom page updates itself. Add the link to both packages' pages under "Working with other packages".
6. **Test** with all three packages loaded, and with each of the two missing ([Testing](testing.md)).
