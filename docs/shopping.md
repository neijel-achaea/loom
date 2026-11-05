# Shopping

*A shopping list priced from the city's directory, grouped by shop in a tab.*

<!-- loom:version shopping -->
*This page describes shopping 0.2.0.*
<!-- /loom:version -->

## What it is

Shopping keeps a list of what you mean to buy, and where. `SHOPPING ADD 5 tinderbox` looks the item up with the game's `DIRECTORY` in the city you're in (the table is hidden while it's read) and puts it under the shop that sells it cheapest. The custom tab named **Shopping** groups the list by shop, so you can see what to buy in each one and how much gold it's likely to cost.

- **By shop.** Each shop with its subtotal and the area it was looked up in, then its items: how many, the price of one, and the line total. The title line counts items and shops and gives the likely total.
- **Every shop kept.** Each item keeps every shop the directory listed, with its price and, for bulk items, its stock. Hover an item to see them, cheapest first.
- **Cheapest, then fewest stops.** An item goes to the cheapest shop; among shops at that price, those with enough stock come first, and then a shop the list visits anyway, so equal prices don't add a stop. This is worked out again whenever the list changes, so an item added earlier moves when a later one makes another shop a stop anyway. When even the chosen shop has too few in stock, the row shows ⚠.
- **Bulk items.** Herbs and other goods sold in bulk are priced for one (`9gp ea`), and the directory puts the shop's stock in front of the name (`1387 kuzu roots`). Shopping takes the count off, so the same goods from different shops are one item: `10 × kuzu roots`.
- **Which one?** A word can match different items (`DIRECTORY VIAL` lists oaken, sandstone and marble vials). Shopping then lists them, cheapest first, in a box at the top of the tab and as notices: click one, or `SHOPPING PICK <number>`. At one price, items sold at a shop already on your list come first, marked ⚑.
- **Adding again.** Adding an item that's already on the list adds to its quantity and takes the fresh price and shops.
- **Removing.** Hover a row for its `×`, or `SHOPPING REMOVE <number|item> [n]` to take some or all of it off.
- **Skipping a shop.** The `×` on a shop's line (or `SHOPPING SKIP <shop|number>`) leaves that shop out: its items move to their next cheapest shops, and the notice says how much more that costs. Items sold nowhere else stay, marked. Skipped shops are listed under the list; click one (or `SHOPPING UNSKIP <shop>|ALL`) to use it again.

Prices are the directory's: a shopkeeper's own policy (discounts, surcharges) can change them, so the totals are an estimate. Each shop's line has a **WALK** button that sends the game's `WALKTO <shop>` once (or `SHOPPING WALK <shop|number>`); the game stops the walk at a closed door or anything else in the way. Inside a shop on the list, its heading reads ◉ HERE and each of its items gets a **BUY** button that sends `BUY <how many> <the word you added it by>` once (or `SHOPPING BUY <number|item>`, refused elsewhere); when the game says you paid and received it (`You pay 80 sovereigns and receive a group of 10 cohosh roots.`), the item comes off the list, or only what you got of it when that's fewer. A shop is recognised by its room's name; when a shop's room has another name, stand in it and type `SHOPPING HERE <shop>` once. Otherwise Shopping sends only `DIRECTORY` when you add something.

## Minimum stocks

Shopping can keep a minimum for anything in your rift, and turn what's short into a list. There are none by default: only what you set counts.

- **Setting one.** `SHOPPING MIN <item> <n>` with the item's name as `IR` shows it (`SHOPPING MIN red ink 100`, `SHOPPING MIN kuzu 500`); `OFF` clears it, `SHOPPING MIN <item>` shows it. Any item: herbs too, since some are less bother to buy than to harvest. Harvesting's minimum still decides what you harvest; shopping's decides what you buy.
- **Reading the rift.** Bare `SHOPPING MIN` reads your whole rift with `IR` (hidden, every page: Shopping sends `MORE` itself) and lists your minimums, what each has, and what's short. The rift is also read once when you log in (only if you have minimums), and the game's "You store … bringing the total in the rift to …" and "You remove …" lines keep it current between readings.
- **Watching a category.** `SHOPPING WATCH herbs ON` makes harvesting's minimums count in Shopping for the herbs you set none for (gathering's likewise for what it gathers, in the categories you watch). Every category starts off; bare `SHOPPING WATCH` lists your rift's categories and which are on.
- **RESTOCK.** `SHOPPING RESTOCK` (or **RESTOCK** in the tab) reads the rift, then puts everything under its minimum on the list, the minimum less what you have, looking each up with `DIRECTORY` by its rift name, one after another. A word the directory knows several items for waits for `PICK` (or `CANCEL` to skip it) before the next lookup; your pick is remembered, so the next RESTOCK takes the same item without asking. An item already on the list is raised to what's short, never doubled.
- **Rift names and the game's words.** RESTOCK looks an item up by its rift name, except where the game knows it by another word: inks are built in (the rift's `red ink` is `redink`). `SHOPPING MIN` also takes the game's word: one found whole in a single item's name (`horn` in *piece of stag's horn*, `silver` in *silver bar*) is that item, and becomes its word if it had none; a word in several names (`red`: red ink, red clay) asks for the full name. `SHOPPING WORD <item> = <word>` sets any other you find (`SHOPPING WORD <item> =` clears it, bare `SHOPPING WORD` lists yours).
- **Commodities.** Coal, wood, silver and the rest of the rift's Commodities aren't in the directory: they're sold in each city's commodity shop. Type `WARES` there once and Shopping notes what that shop sells (its "We Sell At" column) and its stock; RESTOCK then puts each short commodity under the cheapest shop you've read that sells it (one with enough stock first), at that price. **WALK** on such a shop's line sends `PATH FIND` to the room you read WARES in, **BUY** sends `BUY <n> <commodity>`, and "You purchase …" takes it off the list. Read WARES again now and then for fresh stock. A commodity no shop you've read sells (in Cyrene: coal, silver, gold, ice, gems, stone) is named in a notice: those come from the commodities market (to come).
- **Back into the rift.** An item bought for a rift minimum is stored again with `INR` as the game hands it over, queued on balance.
- **The tab** shows how many items are under their minimum, with the **RESTOCK** button, once you have minimums.

## Commands

<!-- loom:commands shopping -->
| Command | What it does |
|---|---|
| `SHOPPING` | the list by shop, numbered, with subtotals and the likely total |
| `SHOPPING ADD [n] <item>` | look it up with DIRECTORY (in a city) and list n of it under its cheapest shop; again adds to the quantity |
| `SHOPPING PICK <number>` | when the directory found different items for a word, the one you mean (or click it in the tab) |
| `SHOPPING REMOVE <number\|item> [n]` | take an item off the list, or only n of it (also the × on its row in the tab) |
| `SHOPPING WALK <shop\|number>` | walk to a shop on the list (WALKTO <shop>), as WALK on its line in the tab |
| `SHOPPING BUY <number\|item>` | in its shop: buy the wanted amount (BUY <n> <word you added it by>), as BUY on its line |
| `SHOPPING HERE [shop\|number]` | which shop you're in; with a shop: this room is it (when its room name differs) |
| `SHOPPING SKIP [shop\|number]` | leave a shop out: its items move to their next cheapest shops (× on its line); bare: the skipped ones |
| `SHOPPING UNSKIP <shop>\|ALL` | use a skipped shop again (or click it under the list) |
| `SHOPPING MIN` | read your rift (IR, hidden): every minimum, and what's under its minimum |
| `SHOPPING MIN <item> [n\|OFF]` | an item's minimum in the rift (its name as IR shows it), for buying; with n set it, OFF clear it. None by default |
| `SHOPPING WATCH [<category> ON\|OFF]` | a rift category (Herbs, Ingredients…) also takes harvesting's or gathering's minimums for items you set none for; all off by default; bare: the categories |
| `SHOPPING RESTOCK` | read your rift and put everything under its minimum on the list (minimum less stock), each looked up in turn; a word you PICKed for before is picked again (also RESTOCK in the tab) |
| `SHOPPING WORD [<item> = <word>]` | the game's word for a rift item when it differs (inks: red ink = redink, built in); <item> = alone clears yours; bare: your words |
| `WARES (the game's)` | in a city's commodity shop: Shopping notes what it sells and at what price; RESTOCK then lists rift commodities under the cheapest shop that sells them, WALK goes there (PATH FIND), BUY buys |
| `SHOPPING GOAL` | with coffers: the list's gold as a coffers goal (GOAL by the total; only what isn't a goal yet) |
| `SHOPPING CLEAR CONFIRM` | wipe the whole list |
| `SHOPPING RESET` | reload the saved list, redraw the tab |
| `SHOPPING DEBUG` | internal state |
| **Prices are the directory's: a shopkeeper's policy can change them. WALK and BUY send one command per click; nothing runs on its own.** | |
| **With ledger installed, a Restock reminder appears when an item of yours falls under 90% of its minimum, and goes once all are back at it (link shopping-ledger).** | |
| **The tab is a custom tab named Shopping.** | |
<!-- /loom:commands -->

`SHOPPING` alone lists everything by shop, numbered; those numbers work with `REMOVE` and `PICK`. `SHOPPING REMOVE 3` takes item 3 off, `SHOPPING REMOVE 3 2` two of it, `SHOPPING REMOVE tinderbox` the item whose description has that word (when only one does).

## Setting it up

1. **Import `shopping.nxs`** (see [Getting started](getting-started.md)).
2. **Create a custom tab named `Shopping`** (exactly that name); it fills in at once.
3. In a city, `SHOPPING ADD [n] <item>` with the word you'd give `DIRECTORY`.

## Daily use

Build the list as you think of things, wherever in the city you are: the directory covers the whole city or area you're in. Before a shopping trip, the tab tells you which shops to visit and roughly how much gold to bring. Take items off as you buy them, or wipe the list with `SHOPPING CLEAR CONFIRM` when you're done.

## Working with other packages

With **coffers** installed, a **GOAL** button sits next to the total: it makes the list's gold a coffers goal at once (added to a goal under way, or a new goal), and turns into ✓ GOAL. Add items later and GOAL comes back, adding only the new gold (`SHOPPING GOAL` does the same). The link can be switched off like any other; `LOOM LINKS` lists them.

| Link | With | What it does |
| --- | --- | --- |
| `coffers-shopping` | coffers | GOAL next to the total makes the gold the list still needs a coffers goal. |
| `shopping-ledger` | ledger | A "Restock" reminder when any of your own minimums falls below 90%; gone once all are back at their minimum. |
| `harvesting-shopping` | harvesting | In watched categories, harvesting's minimums count for the herbs you set none for. |
| `gathering-shopping` | gathering | In watched categories, gathering's minimums count for the materials you set none for. |

Like every package that sends a command and reads its answer, it waits while another package is waiting on an answer of its own, and others wait for its `DIRECTORY` and its `IR`. Its `IR` also refreshes what **harvesting** and **gathering** know of your stock, as any `IR` does.

## Troubleshooting

- **The tab stays empty.** Check the custom tab is named exactly `Shopping`, then `SHOPPING RESET`.
- **"The directory lists nothing".** `DIRECTORY` only covers the city or area you're in; try `DIRECTORY <word>` yourself to see the game's answer.
- **"isn't in your rift now".** The minimum is kept anyway; check the name is the one `IR` shows (`myrrh gum`, `red ink`).
- **"The directory lists nothing" for a rift item.** The game may know it by another word than the rift shows: try `DIRECTORY <word>` yourself, then `SHOPPING WORD <item> = <word>`.
- **RESTOCK wants hundreds of herbs.** A watched category takes harvesting's minimum (2,000 by default) for every herb you set none for: `SHOPPING WATCH herbs OFF`, or set your own.
- **RESTOCK picks the wrong item for a word.** `SHOPPING REMOVE` it, then RESTOCK again and PICK the right one: the new pick is remembered.
- **An item is under the wrong shop or price.** Add it again to refresh its price and shops, or remove it and add it anew. `SHOPPING DEBUG` shows the lookup in progress.
