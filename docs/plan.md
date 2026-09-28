# Project Nosh: plan

A meal-planning web app for Nosh, a charity helping low-income households eat well on a budget. The client brief is in [`brief/`](brief/) ([`brief.md`](brief/brief.md) is a readable transcript).

---

## 1. What we're building

### What the brief asks for

| | The brief asks for | Spec |
|---|---|---|
| **B1** | Pick from built-in starter recipes, or add your own, each with ingredients and a method | F1, F2, F3 |
| **B2** | Set a few basic dietary preferences, so the recipes on offer suit them | F5 |
| **B3** | Plan recipes across the days of the week | F6 |
| **B4** | A combined shopping list from the plan, with the same ingredient from several recipes added up sensibly | F7 |

### Our own feature (the brief's "plus one")

| | Feature | Spec |
|---|---|---|
| **X** | **Cook from what you have.** Pick what's in your kitchen, and see recipes ranked by how little you'd need to buy | F8 |

**Why:** Nosh says planning is the biggest lever for cutting cost and waste. Cooking with what's already in the cupboard is the other half of that.

### Small extras we added

None of these is asked for. Each is small, and each has a reason we can give the Product Owner.

| Extra | Why |
|---|---|
| Ingredient autocomplete in the recipe form (F3) | Keeps ingredient names consistent, so the shopping list adds them up. F8 reuses it |
| The client's recipe tags as badges (F1) | "Quick", "Batch cook" and so on are in the client's data, and useful to their audience |
| Allergy note on Preferences (F5) | Filtering goes by the client's tags, and some look wrong ([Product Owner notes](product-owner-notes.md), note 1) |

### Left out to keep it small

The brief suggests 2 to 3 hours, so these were planned and then cut. Each is a small follow-up if the client wants it.

| Left out | Why it could come back |
|---|---|
| Delete your own recipe | Lets people undo their own mistakes |
| "Your recipes only" switch | Makes your own recipes easy to find among the starter ones |
| A download budget and Lighthouse targets | Pages are still lazy-loaded (§5). Lighthouse is checked in the final pass if there's time |

### Ground rules from the brief
- **Single user**, no logins. Runs locally: a client UI and a separate API, with SQLite.
- **Older, smaller phones.** WCAG AA. Nosh's brand pack (§5).
- **Voice:** warm and plain, no guilt about money. "Buy 2 more", not "Missing 2 ingredients".

### Navigation
- **Three places, matching the brief's three jobs:** Plan · Recipes · Shopping list. Preferences sits behind the settings button, because you set them once.
- **Shopping list is its own place,** not part of Plan. It's used in the shop, often one-handed, so it's one tap away from anywhere.
- **Cooking from your kitchen is a way of finding recipes,** so it's a tab on the Recipes page: "All recipes" and "From your kitchen". Those are the only tabs in the app.

---

## 2. Features

The examples come from the supplied recipe data, and they are the acceptance tests.

### F1. Browse recipes (B1)
- The Recipes page lists every recipe as a card: name, meal types, serves, dietary badges and tag badges.
- **Search** by name filters the loaded list: "chicken" gives Chicken Stir-Fry and Chicken Tikka Masala. The search is kept in the URL (`?q=`).
- **Two tabs:** "All recipes" and "From your kitchen" (F8). The tab is kept in the URL (`?view=kitchen`).
- **Tags:** the client's JSON gives some recipes tags besides the dietary ones: `quick` (5 recipes), `batch-cook` (5), `freezer-friendly` (3), `kid-friendly` (1). They're shown in plain words ("Batch cook") with the outline badge, so they never read as dietary badges. Nothing filters or ranks by them.

### F2. View a recipe (B1)
- Badges, ingredients as written ("1 onion, chopped", "2 cloves garlic"), numbered method, and "Add to plan".
- Shows the days it's planned for ("Planned for Tuesday and Friday").

### F3. Add your own recipe (B1)

| Field | Rule |
|---|---|
| Name | 1–80 characters |
| Serves | 1–12, starting at 1, with − and + buttons either side (it can also be typed) |
| Meal types | at least one |
| Dietary tags | optional |
| Ingredient rows | amount (number or blank), unit (dropdown, default "No unit (e.g. 2 onions)"), ingredient (autocomplete), prep (optional, hint: "Anything else, like 'a pinch' or 'a bunch', can go here.") |
| Method steps | at least one, none empty, moved with up and down buttons |

- **Ingredient autocomplete:** typing suggests known ingredients ("carr" finds "carrot" and "carrots"). Picking one links to it.
  - If the typed name isn't exactly a known ingredient, the last option is `Add "xyz" as a new ingredient`. It shows even when there are partial matches, so "chilli" can be added although "chilli flakes" exists.
  - Leaving the field with a name typed but not picked picks it anyway.
  - The API links a new name to an existing ingredient with the same singular form (§3), so "Carrot" uses "carrot".
- **Errors** show on each bad field. The browser checks against the shared schema, and the API checks again (400 with a message per field). Nothing is saved.
- **Once saved:** it opens the new recipe, marked "Your recipe", and it counts in the shopping list and in F8.
- **No tags field.** Tags are the client's labels for their own recipes.
- **"New recipe"** is a button in the Recipes header.

F4 (delete your own recipe) was cut to keep the app small (§1). The numbering is kept so references stay stable.

### F5. Dietary preferences (B2)
- Preferences screen (the settings button in the header): vegetarian, vegan, gluten-free, dairy-free. Saved as they're ticked.
- **Rule:** a recipe fits if it has every selected tag. Vegan counts as vegetarian and dairy-free. Tags are never guessed from ingredients, so an untagged recipe fits nothing.
- **Every list of recipes** (Recipes page, the plan's recipe picker, F8) shows the recipes that fit first. The rest follow under "These don't quite fit your preferences". Nothing is hidden.
- Below the search, the recipes that fit sit under "These fit your preferences", with the chosen preferences as badges and an "Update preferences" button. With no preferences there are no headings: it's one list.
- An allergy note sits under the checkboxes: recipes go by their labels, so check the ingredients.

| Preferences | Recipes that fit |
|---|---|
| None | all 20 |
| Dairy-free | 5: Chicken Stir-Fry, Chilli con Carne, Lentil Dahl, Thai Green Curry, **Tomato Soup** (via vegan) |
| Vegan | 2: Lentil Dahl, Tomato Soup |
| Vegetarian + gluten-free | 4: Halloumi Salad, Jacket Potato, Lentil Dahl, Tomato Soup |

### F6. Plan the week (B3)
- Seven days, each with any number of meals, e.g. Monday: Porridge, Tomato Soup, Chilli con Carne. A recipe can be on several days.
- **Add from a day** ("Add", then pick a recipe), or **from a recipe** ("Add to plan", then pick a day). A toast confirms: "Added Tomato Soup to Tuesday".
- Remove a meal (×), or "Clear week" (asks first). The plan is saved.

### F7. Shopping list (B4)
- One list, A–Z, of every ingredient in the plan: the name, and the combined amount on the right. Rules in §3.
- A plan of Porridge, Scrambled Eggs, Tomato Soup, Chilli con Carne, Lentil Dahl, Chicken Tikka Masala, Chicken Stir-Fry and Thai Green Curry gives:

| Line | Expected | Rule |
|---|---|---|
| milk | **530 ml** | 500 ml + 2 tbsp: volumes converted and added |
| onion | **4** | counts added |
| garlic | **11 cloves** | same unit added |
| chopped tomatoes | **5 tins** | same unit added |
| chicken breast | **600 g + 2** | weight and count never converted |
| coconut milk | **200 ml + 1 tin** | volume and tin never converted |
| rice / basmati rice / jasmine rice | **600 g / 300 g / 300 g** | different names don't merge |
| red pepper | **2** | not merged with salt and pepper |
| salt and pepper | no amount | no recipe gives one |

- Bolognese (carrot 1) and Shepherd's Pie (carrots 2) give **carrots 3**.
- An empty plan shows "Add some meals to your week and your list will appear here."

### F8. Cook from what you have (X)
- On the Recipes page's "From your kitchen" tab, pick what you have from the same autocomplete. Each pick shows as a chip button below the field that removes it. "Clear all" empties the list. The list is saved.
- **Every recipe is ranked:**
  1. fewest ingredients to buy
  2. then most ingredients you already have
  3. then name A–Z
  4. recipes you have nothing for go last, so a short recipe with nothing in common can't top the list
- **Grouped by preferences** as in F5.
- **Each result:** "You have 4 of 6 · buy 2 more", what to buy with a serial comma ("eggs, bread, and salt and pepper"), and "Add to plan". Each button is read out with its recipe: "Add to plan: Sausage and Mash".
- **Everything counts,** salt and pepper and oil included. There's no staples list, because which ingredients are staples would be our guess. You tick them if you have them.
- **Matching:** by singular form (§3), so "carrot" covers "carrots". "Pepper" isn't "red pepper" or "salt and pepper".
- **Amounts:** the hint under the picker says it goes by what you have, not how much of it.
- **Nothing picked:** every recipe shows A–Z, without counts.

Having potatoes, onion, chopped tomatoes, butter and milk gives:

| # | Recipe | Result |
|---|---|---|
| 1 | Sausage and Mash | have 4 of 6, buy pork sausages and gravy granules |
| 2 | Scrambled Eggs on Toast | have 2 of 5, buy eggs, bread, and salt and pepper |
| 3 | Cheese and Ham Toastie | have 1 of 4, buy bread, cheddar, and ham |

Adding salt and pepper and olive oil gives: 1 Sausage and Mash, 2 Tomato Soup (have 4 of 6, buy garlic and vegetable stock), 3 Scrambled Eggs on Toast (have 3 of 5).

---

## 3. Ingredient and amount rules

**Ingredients are stored exactly as the client wrote them.** One record per distinct name: 79 from the starter data, with "apple" and "apples" as separate records. Recipe pages show names as stored.

**Grouping by singular form** happens when calculating (the shopping list, F8 matching), and is never stored:
1. Lowercase and trim.
2. Make the last word singular with `pluralize`, plus overrides for words it gets wrong (cookies, brownies, quiches).
3. Only exact matches merge: "pepper" ≠ "red pepper" ≠ "salt and pepper", "rice" ≠ "basmati rice".

**Lines use the name as stored,** never changed to suit the amount: "onion 4", "red pepper 2", "lemon 1". Changing a name could make it wrong. When a line merges different spellings, it uses the plural one, which is also a stored name: carrot + carrots gives "carrots 3". The shopping list shows each name with a capital first letter ("Chopped tomatoes"), on screen only. Across the starter data, only apple/apples and carrot/carrots share a singular form (a guard test).

**Units**

| Kind | Units | Rule |
|---|---|---|
| Weight | g, kg | converted to g and added |
| Volume | ml, l, tsp (5 ml), tbsp (15 ml) | converted to ml and added |
| Count | no unit | added |
| Named | tin, slice, rasher, clove, thumb, ball, handful | added only with the same unit |

- **Same kind combines:** 1 kg + 100 g = 1.1 kg, 500 ml + 2 tbsp = 530 ml, 1 tsp + 1 tbsp = 20 ml. **A shared unit is kept:** 1 tbsp + 2 tbsp = 3 tbsp.
- **Different kinds are never converted into each other.** They share a line: "600 g + 2". Counting chicken breasts as grams would mean guessing a weight. The order is always weight, volume, count, then named units.
- **Display:** 1000 g or more as kg, 1000 ml or more as l. Named units plural when not 1 ("2 tins").
- **Rounding, after adding up:** counts and named units up to whole numbers, g and ml to the nearest whole, tsp and tbsp to the nearest 0.5. Never rounded down to zero. So 0.5 + 0.5 onions is 1, not 2.
- **No amount** (salt and pepper): listed with no amount. If another recipe does give one, the line shows that amount. No staples group.

---

## 4. Data and API

### Tables

| Table | Holds | PR |
|---|---|---|
| `recipes` | slug (unique), name, cuisine, serves, `is_builtin` | 0.2 |
| `recipe_steps` | the method, in order | 0.2 |
| `ingredients` | one row per name, unique ignoring case | 0.2 |
| `recipe_ingredients` | a recipe's lines: ingredient, quantity (or null), unit (or null), prep | 0.2 |
| `recipe_dietary`, `recipe_meal_types` | a recipe's dietary tags and meal types, as values from fixed lists in `shared` | 0.2 |
| `tags`, `recipe_tags` | the client's other tags, and which recipes have them | 0.2 |
| `plan_entries` | one recipe on one day (1–7) | 2.1 |
| `preferences` | a single row: the dietary preferences as a JSON array | 4.1 |
| `kitchen_items` | the ingredients you have | 6.1 |

- The shopping list and F8 rankings are worked out on each request, never stored.
- The database is `apps/api/.data/nosh.sqlite` (gitignored). On start: migrate, then seed from the JSON if there are no recipes.

### Endpoints

| Method and path | What it does | PR |
|---|---|---|
| `GET /api/recipes` | Every recipe summary, A–Z. From PR 4.1: `{ matching, others }`, split by the saved preferences | 0.2, 4.1 |
| `GET /api/recipes/:slug` | One recipe in full, or 404. From PR 2.2, with the days it's planned for | 1.2, 2.2 |
| `GET /api/plan` | The seven days, Monday first, each with its meals (recipe summary included) | 2.1 |
| `POST /api/plan` | `{ day, recipeSlug }`: adds a meal. 201, or 400 with a message per field | 2.1 |
| `DELETE /api/plan/:id` | Removes one meal. 404 if it isn't there | 2.1 |
| `DELETE /api/plan` | Clears the week | 2.1 |
| `GET /api/shopping-list` | `{ items: [{ name, amounts, amountText, usedIn }] }`, A–Z, built from the plan. `usedIn` is the names of the planned recipes that use it, each once, A–Z | 3.2 |
| `GET` / `PUT /api/preferences` | Reads or replaces the dietary preferences | 4.1 |
| `GET /api/ingredients` | Known ingredients `[{ id, name }]`, A–Z, for the autocomplete | 5.1 |
| `POST /api/recipes` | Adds your recipe. Each ingredient is `{ kind: 'existing', id }` or `{ kind: 'new', name }`. 201 with the recipe, or 400 per field | 5.1 |
| `GET` / `PUT /api/kitchen` | Reads or replaces `{ ingredientIds }` | 6.1 |
| `GET /api/kitchen/matches` | Every recipe ranked by what you'd buy (F8), as `{ matching, others }` | 6.1 |

Every error is `{ error: { code, message, fields? } }`.

---

## 5. Architecture and UI

### Stack
TypeScript (strict, pinned `~6.0`) · pnpm workspaces · **web:** React 19, Vite, React Router (declarative), TanStack Query, Tailwind v4, shadcn/ui (Base UI, lucide), react-hook-form (New recipe only) · **API:** Node 22 (running the TypeScript directly, so no build step), Express 5, Drizzle, better-sqlite3, `pluralize` · **shared:** zod schemas and constants · **tests:** Vitest, supertest · **lint:** ESLint's recommended sets (`@eslint/js`, `typescript-eslint` recommended-type-checked, `react-hooks`, `jsx-a11y`) and `eslint-config-prettier`. The one addition is ESLint's own `no-restricted-imports`, set up so web imports flow one way (shared code → features → app) and features never import each other; new feature folders are added to `webFeatures` in `eslint.config.js`.

**Why Node runs the TypeScript itself:** Node 22 strips types natively, so the API and `@nosh/shared` run as written, with no build step and no `tsx`. The cost is two compiler settings: relative imports end in `.ts` (`allowImportingTsExtensions`), and only syntax that can be erased is allowed, so no enums (`erasableSyntaxOnly`).

**Why Drizzle, not plain SQL:** the brief asks us to build it as we would for a client. Drizzle keeps the database typed like the rest of the app, adds real migrations, and parameterises every query, for a config file, a schema file and a few generated migrations.

### Structure
```
apps/api/src   domain/ (pure rules, no I/O) · db/ · repositories/ · routes/ (validate, call, respond) · http/ · app.ts
apps/web/src   app/routes (combines features) · components/{ui,layout} · features/<name>/{api,components} · lib/ · utils/
packages/shared  zod schemas, types and constants (DIETARY, MEAL_TYPES, DAYS, UNITS)
```
- **Rules live in `domain/`** and are tested first. Routes hold no rules.
- **Web features never import each other.** The route combines them, e.g. the Plan route puts the recipe picker in the plan's sheet.
- **Query keys live in `lib/query-keys.ts`,** because mutations refresh other features' data:

| Change | Refreshes |
|---|---|
| add, remove or clear plan meals | plan, shopping list, recipe pages (planned days) |
| save preferences | preferences, recipes, kitchen matches |
| add a recipe | recipes, ingredients, kitchen matches |
| change the kitchen | kitchen, kitchen matches |

### Layout
- **Phone first (360px).** Below `md`: a bottom tab bar (Plan · Recipes · Shopping list) and a settings button in the top bar. From `md`: all links, and Preferences, in the top bar. One `nav-items` list feeds both. Why, in §1 "Navigation".
- **Every page uses the shell's width** (`max-w-5xl`). Wide screens get grid columns, not narrower pages.
- **Tailwind defaults only.** No arbitrary values; colours only through theme tokens.
- **shadcn's defaults, unchanged.** `components/ui` stays exactly as upstream wrote it, so updates stay simple. Its default sizes meet WCAG 2.2 AA's 24px target size (a default button is 32px), and its inputs use 16px text on phones, so they don't zoom. Our own markup (the top bar and tab bar) uses 44px targets. We first raised shadcn's components to 44px, but dropped that in PR 1.1: for a demo, keeping upstream as it is was worth more.

| Screen | Layout | PR |
|---|---|---|
| Plan | Seven rows in one bordered list, today highlighted. Each day: name, "Add" (icon and text), then its meals, or empty. "Clear week" at the top, opposite the title | 2.1 |
| Add to plan | A sheet from the bottom on phones, from the right from `md` | 2.1, 2.2 |
| Recipes | "All recipes" / "From your kitchen" tabs. On "All recipes": search, the preference line, cards in `sm:grid-cols-2 lg:grid-cols-3`. "New recipe" in the header | 1.1, 4.1, 5.1, 6.1 |
| Recipe | Badges, "Add to plan", then ingredients (1 column) and method (2 columns) from `lg` | 1.2, 2.2, 5.1 |
| Shopping list | One bordered list, one line per ingredient: name left (first letter capitalised), amount bold right. From `lg`, two columns running A–Z down then on | 3.2 |
| Preferences | The four choices as shadcn's choice cards (as in the day picker), each one tap target, a ticked one tinted and ticked. Allergy note underneath | 4.1 |
| New recipe | One column. Ingredient rows read like the line they make (amount and unit, ingredient, prep); one line per row from `lg`. Numbered steps with move and remove buttons | 5.1 |
| From your kitchen (Recipes tab) | Picker with chips below it and "Clear all", then result cards | 6.1 |

**Badges:** dietary tags use `secondary` (light green), the client's other tags use `outline`, "Your recipe" uses `leaf`.

**Components:** `Sheet`, not `Drawer` (no extra dependency). `NativeSelect` for units (the phone's own picker). One `IngredientCombobox`, single mode in the form, multiple in the kitchen. Kitchen chips sit below the field as buttons, because shadcn's in-field chips are about 21px, under the 24px AA minimum.

### Theme (contrast measured)

| Token | Value | Contrast |
|---|---|---|
| background / foreground | white / Nosh Charcoal `#2E373E` | 12.1:1 |
| primary / primary-foreground | Nosh Green `#62CC9B` / Charcoal | 6.14:1. **Never white on green** (1.98:1) |
| secondary, accent | light green tint / Charcoal | ≥ 10:1 |
| muted-foreground | `#5F6B73` | 5.47:1 |
| ring | Deep Teal `#3AA58F` | 3.02:1 (non-text) |
| destructive | darkened Flame Coral `#B9471F` | 5.27:1 |
| leaf | Leaf `#D5C52D` / Charcoal | 6.84:1 |
| input | field borders `#8A959C` | 3.06:1 (non-text) |
| header / header-foreground / header-muted | Charcoal / white / Cloud Grey `#B7BFC0` | 12.1:1 / 6.48:1 |

- Charcoal top bar with the logo. Cloud Grey only on Charcoal. Flame Coral only for icons and borders.
- **Deep Teal is only the focus ring,** although the brief calls it "secondary". It fails AA for text either way (3.02:1 with white, 4.0:1 with Charcoal), so `secondary` is a light green tint instead.
- **Logo:** the mark and wordmark side by side, unaltered, with the "O"-width clear space. That limits it to 30px tall in a 72px bar. The favicon is the mark alone.
- **Type:** Nunito Bold for headings (self-hosted, Latin only), system sans for body. The brief allows either Nunito Sans or system sans for body; system sans needs no download, which suits older phones on slow connections.

### Performance
- Only the Plan page is in the first download. Every other page, and the Plan page's sheets and dialogs, load when first opened (`React.lazy` and `Suspense` in the router).
- No download budget. Lighthouse mobile is checked in the final pass if there's time.

---

## 6. How we work

**Phases follow the brief's features. Each phase ships as small PRs, one at a time.** I build a PR, you review it, you decide when it's done.

1. **I build one PR** on a branch `<type>/<pr>-<name>` (e.g. `feat/1.1-recipe-list`), in several small Conventional Commits, one concern each. Domain rules get their tests committed first.
2. **I open a PR and stop.** The PR says:
   - what you can now do in the app
   - endpoints added or changed, and what each does
   - tables added
   - screens and components added or changed
   - what to review closely
   - how to try it
3. **You review.** If you ask a question, I answer it and don't change code. I change code when you ask me to.
4. **Fixes go in new commits** on the same branch, never a force-push, so you can see what changed since your review.
5. **You say when to merge.** It's squash-merged, so the PR title is a Conventional Commit. The individual commits stay visible in the PR on GitHub.
6. **The next PR starts when you say.**

**PR size:** aim for something you can review in one sitting, roughly 300–600 changed lines of hand-written code (tests, the lockfile, migration snapshots and generated shadcn files don't count). If a PR is heading well past that, I stop and suggest a split before opening it.

**Guardrails**
- **Nothing is added before it's used:** constants, schemas, tables, endpoints, components, dependencies.
- **Anything not in the brief is flagged** before it's built, with the reason, so you can decide.
- **Questions for the client go in [`docs/product-owner-notes.md`](product-owner-notes.md)** in the PR where we find them, to raise at the end.
- **`pnpm check` passes** before every commit. Each visible change is checked at 360px and 1280px.
- **New screens are planned with the `frontend-design` skill** first.
- **This plan is updated in the same PR** when a decision changes it.

---

## 7. Phases

Eight phases: setup, one for each brief feature, our own feature, and a final pass. Eleven PRs plus the final pass, each with several small commits, reviewed and merged one at a time (§6).

| Phase | PRs | Done |
|---|---|---|
| **0. Setup** | 0.1 Repository and app shell · 0.2 API and database | [ ] |
| **1. Recipes (B1)** | 1.1 Recipe list and search · 1.2 Recipe page | [ ] |
| **2. Plan the week (B3)** | 2.1 The week: add, remove, clear (as 2.1a API and 2.1b screen) · 2.2 Add to plan from a recipe | [ ] |
| **3. Shopping list (B4)** | 3.1 Rules · 3.2 The list | [ ] |
| **4. Dietary preferences (B2)** | 4.1 Save them, and show recipes that fit first | [ ] |
| **5. Your own recipes (B1)** | 5.1 API and form | [ ] |
| **6. From your kitchen (X)** | 6.1 Rules, picker and ranked recipes | [ ] |
| **7. Final pass** | 7.1 Review, docs and demo run | [ ] |

**Watch the size of 5.1 and 6.1.** They're the largest. If either heads well past 600 hand-written lines, I stop and suggest a split: API before UI for 5.1, rules before UI for 6.1.

### Phase 0: Setup

#### PR 0.1: Repository and app shell
- **Adds:**
  - root `package.json` (pnpm 12, Node 22, scripts fanned out to workspaces), `pnpm-workspace.yaml`, `.gitignore` (including `.DS_Store`), `.nvmrc`, `tsconfig.base.json`, Prettier, ESLint (recommended sets only, §5), `data/project-nosh-sample-recipes.json`, a README stub
  - Vite and React in `apps/web`, Tailwind and shadcn (`button`, `empty`)
  - the theme tokens, Nunito, and 44px buttons
  - the logo, optimised under 15 KB
  - routes with placeholder pages, lazy-loaded: Plan (`/`), Recipes, Shopping list, Preferences, Not found
  - top bar and bottom tab bar, with the current page marked by more than colour
- **Prettier ignores** `data/` (the client's JSON is never reformatted), Markdown, and `components/ui` (shadcn's files stay as upstream wrote them, so updates diff cleanly).
- **Check:**
  - `pnpm install` and `pnpm check` run clean. The JSON is byte-identical to the supplied file.
  - At 360px the tab bar switches pages and covers nothing. At 1280px the links are in the top bar. An unknown URL shows Not found.

#### PR 0.2: API and database
- **Adds:**
  - `packages/shared`: `DIETARY`, `MEAL_TYPES`, `UNITS` (with plurals), the starter-recipe schema, the recipe-summary schema (with `tags`), the error body
  - `apps/api`: `createApp(db)`, JSON errors, the database client (foreign keys on, WAL), the Drizzle schema and the recipe tables' migration, the seed (one transaction, idempotent), `pnpm db:reset`
- **API:** `GET /api/recipes`: every recipe summary, A–Z.
- **Review closely:** the seed keeps every ingredient name exactly as written.
- **Check:**
  - all 20 starter recipes pass the schema
  - the seed makes 20 recipes, 79 ingredients and 132 lines matching the JSON
  - `curl localhost:3002/api/recipes` returns 20
  - Porridge's `tags` are `["quick"]`

### Phase 1: Recipes (B1)

#### PR 1.1: Recipe list and search
- **You can:** open Recipes, see all 20 recipes, and type part of a name to filter them.
- **Web:**
  - TanStack Query, the `fetch` client, query keys, the `/api` proxy
  - `features/recipes`: `get-recipes` and the recipe card (name, meal types, serves, dietary badges, tag badges via `formatTag`, "batch-cook" → "Batch cook"). Loading skeleton, error with retry
  - the search box, filtering the loaded list, kept in the URL (`?q=`). A count line ("2 recipes match 'chicken'"), and an empty state with "Clear search"
- **Check:** 20 cards. Porridge shows "Quick" (outline) beside "Vegetarian" (green). "chicken" gives Chicken Stir-Fry and Chicken Tikka Masala. Opening a recipe and going back keeps the search.

#### PR 1.2: Recipe page
- **You can:** tap a recipe to see its ingredients and method.
- **API:** `GET /api/recipes/:slug`: one recipe in full, or 404.
- **Web:** the recipe page: badges, ingredients with amounts ("2 cloves garlic"), numbered method, a back link, and a Not found page for an unknown recipe.
- **Check:** Tomato Soup shows its 6 ingredients and 4 steps. `/recipes/beans-on-toast` shows Not found.

### Phase 2: Plan the week (B3)

#### PR 2.1: The week: add, remove, clear
- **Split in two,** as it came to 779 hand-written lines: **2.1a** the API (`groupByDay`, the plan schemas, `plan_entries` and the four endpoints) and **2.1b** the screen (the recipe picker, the week, the sheet and the dialog), opened on top of 2.1a.
- **You can:** see the week, add a recipe to a day, remove a meal, and clear the week.
- **Data:** `plan_entries`.
- **API:**
  - `GET /api/plan`: seven days with their meals
  - `POST /api/plan`: `{ day, recipeSlug }`, 201, or 400 with a message per field
  - `DELETE /api/plan/:id`: removes one meal, 404 if it isn't there
  - `DELETE /api/plan`: clears the week
- **Shared:** `DAYS`, the plan schemas, `toFieldErrors`. The error handler turns bad input into a 400 with a message per field, and bad JSON into a 400.
- **Web:** `features/plan`: seven day rows, today highlighted, an empty state per day. "Add" opens a sheet with the recipe picker from `features/recipes`. A toast confirms. × on each meal (focus moves to that day's "Add"), and "Clear week" with a confirmation.
- **Check:** Monday holds Porridge, Tomato Soup and Chilli con Carne. One recipe can go on two days. A reload keeps the plan. "Clear week" asks first, then empties every day.

#### PR 2.2: Add to plan from a recipe
- **You can:** on a recipe page, press "Add to plan" and pick a day. The page shows which days it's planned for.
- **API:** `GET /api/recipes/:slug` gains `plannedOn`.
- **Web:** "Add to plan" opens a sheet with the seven days (today picked to start with). "Planned for Tuesday and Friday". Plan changes refresh recipe pages.
- **Check:** adding Tomato Soup to Tuesday shows it on the Plan page and "Planned for Tuesday" on the recipe.

### Phase 3: Shopping list (B4)

#### PR 3.1: Shopping list rules
- **Adds only rules and tests,** no screen, so the maths can be reviewed on its own.
- **Shared:** each unit gains its kind and size, plus the shopping-list schema.
- **Domain,** tests first:
  - `units`: adding amounts within a kind, keeping a shared unit, rounding, display
  - `ingredients`: `toKey` (singular form with `pluralize` and the overrides)
  - `shopping-list`: builds the list from planned recipes, with names as stored (§3)
- **Review closely:** every §3 rule and F7 row is a test. Guard test: only apple/apples and carrot/carrots share a key.

#### PR 3.2: The shopping list
- **You can:** open Shopping list and see everything the week's meals need, A–Z.
- **API:** `GET /api/shopping-list`: builds the list from the plan on each request.
- **Web:** `features/shopping-list`: the list, the empty state. Plan changes refresh the list.
- **Check:** the F7 plan gives every F7 row, Bolognese and Shepherd's Pie give "carrots 3", and an empty plan shows the message.

### Phase 4: Dietary preferences (B2)

#### PR 4.1: Save preferences, and show recipes that fit first
- **You can:** tick your dietary preferences, and see the recipes that fit first, everywhere recipes are offered.
- **Data:** `preferences`.
- **Domain,** tests first: `meetsPreferences` (the vegan rule, all must match, untagged fits nothing) and `groupByPreferences`.
- **API:**
  - `GET` and `PUT /api/preferences`. Each preference is saved once, in display order
  - `GET /api/recipes` returns `{ matching, others }`
- **Web:**
  - `features/preferences`: four checkboxes, saved as they're ticked (shown straight away, put back if saving fails), the vegan description, the allergy note
  - the Recipes list and the plan's recipe picker show the recipes that fit under "These fit your preferences" (with the preferences as badges and "Update preferences"), and the rest under "These don't quite fit your preferences". Saving preferences refreshes the recipes
- **Check:** ticks survive a reload. Every row of the F5 table.

### Phase 5: Your own recipes (B1)

#### PR 5.1: Add your own recipe
- **You can:** fill in a form to add your recipe. It's marked "Your recipe", and counts in the shopping list and in F8.
- **Shared:** the recipe input schema (with tests for bad input), the ingredient schema, `isOwn` on summaries.
- **Domain,** tests first:
  - `slugify` / `uniqueSlug`: all 20 starter slugs reproduced, "new" is reserved
  - `matchIngredient`: an exact match first, then the same singular form
- **API:**
  - `GET /api/ingredients`
  - `POST /api/recipes`: 201 with the recipe, or 400 per field (including an unknown ingredient id)
- **Web:**
  - "New recipe" in the Recipes header, and the `/recipes/new` route, lazy-loaded
  - react-hook-form with the shared schema
  - `IngredientCombobox` (single mode), the serves stepper, the unit select, the prep hint
  - steps with move up, move down and remove, where focus follows the moved step
  - API errors shown on their fields
  - "Recipe saved", then the new recipe opens
  - the "Your recipe" badge (Leaf) on cards and the recipe page
- **Review closely:** the combobox (the "Add" option, and leaving the field keeps what was typed).
- **Check:**
  - "Carrot" links to "carrot", so a new recipe's carrots add up with Shepherd's Pie's on the shopping list
  - a second "Tomato Soup" gets `tomato-soup-2`
  - saving an empty form shows an error on each bad field and saves nothing

### Phase 6: From your kitchen (X)

#### PR 6.1: From your kitchen
- **You can:** open the "From your kitchen" tab on Recipes, pick what you have (it's remembered), and see recipes ranked by how little you'd need to buy, then add one to your plan.
- **Data:** `kitchen_items`.
- **Domain,** tests first: `rankByMissing` (the F8 order, singular-form matching, a doubled ingredient counted once, recipes you have nothing for last, nothing picked gives A–Z). `groupByPreferences` can read tags from inside each item.
- **API:**
  - `GET` and `PUT /api/kitchen`. 400 for an unknown ingredient
  - `GET /api/kitchen/matches`: ranks every recipe and groups by preferences
- **Web:**
  - `IngredientCombobox` gains multiple mode: chip buttons below the field, A–Z, and focus moves to the next chip when one is removed
  - `features/kitchen`: the picker, saved as it changes, with "Clear all"
  - the Recipes page gains its two tabs, "All recipes" and "From your kitchen" (`?view=kitchen`), combined in the Recipes route. Check "From your kitchen" fits beside "All recipes" at 360px
  - result cards: "You have 4 of 6 · buy 2 more", what to buy, "Add to plan" (named for its recipe). Nothing picked shows A–Z without counts
  - changing the kitchen, a recipe or preferences refreshes the ranking
- **Review closely:** both F8 examples, and "pepper" alone matching nothing.
- **Check:** both F8 examples in the app. Picks survive a reload. Removing a chip keeps keyboard focus.

### Phase 7: Final pass

#### PR 7.1: Review, docs and demo run
- **`/code-review`** on the whole app. Fix what it finds, one `fix:` commit each.
- **Lighthouse** mobile on the production build, if there's time. No target is required.
- **README:** setup, architecture, decisions (including what we left out, §1), the Product Owner notes (`docs/product-owner-notes.md`).
- **Demo run-through:** `pnpm db:reset`, then every §2 example in the app.
